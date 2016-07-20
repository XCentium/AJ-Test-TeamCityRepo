using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using AutoMapper;
using Insite.Cart.Services.Handlers;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Common.Providers;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Emails;
using Insite.Core.Interfaces.Plugins.Pricing;
using Insite.Core.Plugins.Application;
using Insite.Core.Plugins.Cart;
using Insite.Core.Plugins.Emails;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.Integration;
using Insite.Core.Plugins.Inventory;
using Insite.Core.Plugins.PromotionEngine;
using Insite.Core.Plugins.Tax;
using Insite.Core.Plugins.Utilities;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Core.Translation;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Payments.Services;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("UpdateCartSubmitHandler")]
    public class UpdateCartSubmitHandler_Morsco : UpdateCartSubmitHandler
    {
        // Order 899 is just before the current UpdateCartSubmitHandler
        public override int Order => 900;

        public UpdateCartSubmitHandler_Morsco(Lazy<ITaxEngine> taxEngine, Lazy<IPromotionEngine> promotionEngine, Lazy<IBuildEmailValues> buildEmailValues,
            Lazy<IEmailService> emailService, Lazy<IProductUtilities> productUtilities, Lazy<IIntegrationJobSchedulingService> integrationJobSchedulingService,
            Lazy<IPaymentService> paymentService, Lazy<ICartOrderProviderFactory> cartOrderProviderFactory,
            Lazy<IApplicationSettingProvider> applicationSettingProvider,
            Lazy<IPricingServiceFactory> pricingServiceFactory, Lazy<IInventoryProvider> inventoryProvider, Lazy<ICurrencyFormatProvider> currencyFormatProvider,
            IOrderLineUtilities orderLineUtilities, Lazy<IPromotionResultServiceFactory> promotionResultServiceFactory,
            ICustomerOrderUtilities customerOrderUtilities,
            Lazy<IEntityTranslationService> entityTranslationService)
            
            :base(taxEngine, promotionEngine, buildEmailValues, emailService, productUtilities, integrationJobSchedulingService, paymentService, cartOrderProviderFactory,
                    applicationSettingProvider, pricingServiceFactory, inventoryProvider, currencyFormatProvider, orderLineUtilities, 
                    promotionResultServiceFactory, customerOrderUtilities, entityTranslationService)
        {
        }

        protected override UpdateCartResult SubmitCart(IUnitOfWork unitOfWork, UpdateCartParameter parameter, UpdateCartResult result)
        {
            if (SiteContext.Current.UserProfile == null)
                return CreateErrorServiceResult(result, SubCode.CartServiceSignInTimedOut, MessageProvider.Current.ReviewAndPay_SignIn_TimedOut);

            CustomerOrder cart = result.GetCartResult.Cart;

            if (!cart.OrderLines.Any())
                return CreateErrorServiceResult(result, SubCode.CartServiceNoOrderLines, MessageProvider.Current.Cart_NoOrderLines);

            if (result.GetCartResult.RequiresPoNumber && cart.CustomerPO.IsBlank())
                return CreateErrorServiceResult(result, SubCode.CartServiceCustomerPoRequired, MessageProvider.Current.ReviewAndPay_PONumber_Required);

            if (!unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>().GetOrCreateByName<bool>("AllowEmptyShipping", SiteContext.Current.Website.Id) && cart.ShipVia == null)
                return CreateErrorServiceResult(result, SubCode.CartServiceInvalidShipVia, MessageProvider.Current.Checkout_InvalidShippingSelection);

            if (cart.Status.EqualsIgnoreCase("QuoteRequested"))
            {
                if (cart.Type == "Quote")
                    return CreateErrorServiceResult(result, SubCode.CartAlreadySubmitted, "This Quote has already been Requested and can not be requested again");
                SetCustomerOrderNumber(unitOfWork, cart);
                SetCustomerOrderInfo(cart);
                cart.Type = "Quote";
            }

            if (cart.Status != "Cart" && cart.Status != "QuoteProposed" && (cart.Status != "Saved" && cart.Status != "PunchOut") && (cart.Status != "PunchOutOrderRequest" && cart.Status != "AwaitingApproval"))
                return CreateErrorServiceResult(result, SubCode.CartAlreadySubmitted, "This Order has already been Submitted and can not be submitted again");

            if (cart.Status.EqualsIgnoreCase("QuoteProposed"))
            {
                cart.OrderLines.ToList().ForEach(l => OrderLineUtilities.CalculatePrice(l, false));
                if (!cart.QuoteExpirationDate.HasValue)
                {
                    int byName = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>().GetOrCreateByName<int>("RFQ_QuoteExpireDays", SiteContext.Current.Website.Id);
                    cart.QuoteExpirationDate = DateTimeProvider.Current.Now.Date.AddDays(byName + 1).AddMinutes(-1.0);
                }
                PromotionEngine.Value.ClearPromotions(cart);
            }

            SetCustomerOrderNumber(unitOfWork, cart);

            SetCustomerOrderInfo(cart);

            for (int index = cart.OrderLines.Count - 1; index >= 0; --index)
            {
                OrderLine orderLine = cart.OrderLines.ElementAt(index);
                if (!ProductUtilities.Value.IsQuoteRequired(orderLine.Product) || cart.Status == "QuoteProposed")
                {
                    ProcessInventory(orderLine);
                    ProcessSubscriptionPurchase(unitOfWork, cart, orderLine);
                }
            }

            SetCustomerOrderStatus(cart);

            ProcessGiftCardTransaction(cart);

            result = ProcessCreditCardTransaction(unitOfWork, cart, parameter, result);

            if (result.ResultCode != ResultCode.Success)
                return result;

            PostThirdPartyTax(cart);

            if (cart.Type != "Quote" && cart.OrderLines.Count(line => ProductUtilities.Value.IsQuoteRequired(line.Product)) > 0)
            {
                List<OrderLine> list = cart.OrderLines.Where(line => ProductUtilities.Value.IsQuoteRequired(line.Product)).ToList();
                MoveListOfItemsBackToCart(cart, list);
            }

            try
            {
                unitOfWork.Save();

                //Customization point:  We need Order History in order for the WIS processing to be complete.  
                //So we moved CreateOrderHistory to before SubmitOrderToErp
                CreateOrderHistory(unitOfWork, cart);
                // end customization

                SubmitOrderToErp(cart, unitOfWork);
            }
            finally
            {
                SendOrderConfirmationEmail(unitOfWork, cart);
            }
            return result;
        }

        protected override void CreateOrderHistory(IUnitOfWork unitOfWork, CustomerOrder customerOrder)
        {
            Insite.Data.Entities.OrderHistory inserted = Mapper.DynamicMap<Insite.Data.Entities.OrderHistory>(customerOrder);
            //Customization Point.  Need the OrderHistory's OrderDate datetimeoffset to be the 00:00:00 in the UTC offset.  
            //Then it matches the date-only date we get from Eclipse/Ponderosa.
            inserted.OrderDate = DateTimeOffset.ParseExact(
                inserted.OrderDate.ToString("MM/dd/yyyy"),
                "MM/dd/yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal);

            inserted.OrderTotal = CustomerOrderUtilities.GetOrderGrandTotal(customerOrder);
            inserted.DiscountAmount = CustomerOrderUtilities.GetPromotionOrderDiscountTotal(customerOrder);
            inserted.OtherCharges = Decimal.Zero;
            inserted.ProductTotal = CustomerOrderUtilities.GetOrderSubTotal(customerOrder);
            inserted.Salesperson = customerOrder.Salesperson != null ? customerOrder.Salesperson.Name : string.Empty;
            inserted.ShipCode = customerOrder.ShipVia != null ? customerOrder.ShipVia.ShipCode : string.Empty;
            inserted.TaxAmount = CustomerOrderUtilities.GetTotalTax(customerOrder);
            inserted.ShippingAndHandling = CustomerOrderUtilities.GetShippingAndHandling(customerOrder);
            inserted.Terms = customerOrder.TermsCode;
            inserted.WebOrderNumber = customerOrder.OrderNumber;
            inserted.CurrencyCode = customerOrder.Currency != null ? customerOrder.Currency.CurrencyCode : string.Empty;
            CustomerProduct[] customerProductArray = null;
            if (customerOrder.Customer != null)
            {
                Guid[] productIds = customerOrder.OrderLines.Select(x => x.ProductId).ToArray();
                customerProductArray = unitOfWork.GetRepository<CustomerProduct>().GetTable().Where(x => x.CustomerId == customerOrder.CustomerId && productIds.Contains(x.ProductId)).ToArray();
            }
            foreach (OrderLine orderLine in customerOrder.OrderLines)
            {
                OrderHistoryLine orderHistoryLine = new OrderHistoryLine
                {
                    Status = orderLine.Status,
                    Description = orderLine.Description,
                    Notes = orderLine.Notes,
                    QtyOrdered = orderLine.QtyOrdered,
                    UnitOfMeasure = orderLine.UnitOfMeasure,
                    CustomerNumber = customerOrder.CustomerNumber,
                    CustomerProductNumber = GetCustomerProductNumber(customerProductArray, orderLine),
                    CustomerSequence = customerOrder.CustomerSequence,
                    DiscountAmount = orderLine.PromotionResult != null ? PromotionResultServiceFactory.Value.GetPromotionResultService(orderLine.PromotionResult).ProductDiscount(customerOrder) : Decimal.Zero,
                    DiscountPercent = OrderLineUtilities.GetOrderLineSavingsPercent(orderLine),
                    InventoryQtyOrdered = orderLine.QtyOrdered,
                    InventoryQtyShipped = orderLine.QtyShipped,
                    LastShipDate = orderLine.ShipDate,
                    LineNumber = orderLine.Line,
                    LinePOReference = orderLine.CustomerPOLine,
                    LineTotal = OrderLineUtilities.GetExtendedActualPrice(orderLine),
                    LineType = string.Empty,
                    ProductErpNumber = orderLine.Product.ErpNumber,
                    PromotionAmountApplied = OrderLineUtilities.GetOrderLineSavingsAmount(orderLine),
                    RmaQtyReceived = Decimal.Zero,
                    RmaQtyRequested = Decimal.Zero,
                    ReleaseNumber = orderLine.Release,
                    RequiredDate = orderLine.DueDate,
                    UnitPrice = orderLine.ActualPrice,
                    Warehouse = orderLine.Warehouse != null ? orderLine.Warehouse.Name : string.Empty
                };
                inserted.OrderHistoryLines.Add(orderHistoryLine);
            }
            unitOfWork.GetRepository<Insite.Data.Entities.OrderHistory>().Insert(inserted);
            unitOfWork.Save();
        }
    }
}

