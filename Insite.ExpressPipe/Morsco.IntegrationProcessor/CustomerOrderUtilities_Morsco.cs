using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using Insite.Common.Dependencies;
using Insite.Common.Helpers;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Plugins.PromotionEngine;
using Insite.Core.Plugins.Utilities;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using Insite.Plugins.EntityUtilities;

namespace Morsco.IntegrationProcessor
{
    public class CustomerOrderUtilities_Morsco : CustomerOrderUtilities, ICustomerOrderUtilities, IDependency
    {
        public CustomerOrderUtilities_Morsco(IUnitOfWorkFactory unitOfWorkFactory, Lazy<IPromotionAmountProvider> promotionAmountProvider, Lazy<IOrderLineUtilities> orderLineUtilities, Lazy<IRoundingRulesProvider> roundingRulesProvider, Lazy<IProductUtilities> productUtilities)
          : base(unitOfWorkFactory, promotionAmountProvider, orderLineUtilities, roundingRulesProvider, productUtilities)
        {
        }

        // Customization Point: The Insite Object Helper does not return DateTimeOffsets in datasets due to a b.u.g.  
        // To work around that, we're going to force this method to use a different ObjectHelper class that doesn't have the issue.
        public new DataSet GetCustomerOrderDataSet(CustomerOrder customerOrder)
        {
            try
            {
                DataSet dataSet = new DataSet("CustomerOrderDataSet");
                DataTableCollection tables1 = dataSet.Tables;

                ArrayList arrayList1 = new ArrayList();
                arrayList1.Add((object) customerOrder);
                Type type1 = customerOrder.GetType();
                DataTable dataTableFromList1 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList1, type1);
                tables1.Add(dataTableFromList1);

                DataTableCollection tables2 = dataSet.Tables;
                ArrayList arrayList2 = new ArrayList();
                arrayList2.Add((object) customerOrder.Customer);
                Type type2 = customerOrder.Customer.GetType();
                DataTable dataTableFromList2 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList2, type2);
                tables2.Add(dataTableFromList2);

                DataTable dataTableFromList3 =
                    ObjectHelper_Morsco.GetDataTableFromList(
                        (IList) Enumerable.ToList<CustomProperty>((IEnumerable<CustomProperty>) customerOrder.Customer.CustomProperties), typeof(CustomProperty),
                        "CustomerID", new Guid?(customerOrder.Customer.Id));
                dataTableFromList3.TableName = "CustomerProperty";
                dataSet.Tables.Add(dataTableFromList3);

                ArrayList arrayList3 = new ArrayList();
                arrayList3.Add((object) customerOrder.ShipTo);
                Type type3 = customerOrder.ShipTo.GetType();
                DataTable dataTableFromList4 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList3, type3);
                dataTableFromList4.TableName = "ShipTo";
                dataSet.Tables.Add(dataTableFromList4);

                DataTable dataTableFromList5 =
                    ObjectHelper_Morsco.GetDataTableFromList(
                        (IList) Enumerable.ToList<CustomProperty>((IEnumerable<CustomProperty>) customerOrder.ShipTo.CustomProperties), typeof(CustomProperty),
                        "ShiptoID", new Guid?(customerOrder.ShipTo.Id));
                dataTableFromList5.TableName = "ShipToProperty";
                dataSet.Tables.Add(dataTableFromList5);

                State stateByName1 = this.UnitOfWork.GetTypedRepository<IStateRepository>().GetStateByName(customerOrder.Customer?.State?.Name);
                if (stateByName1 != null)
                {
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) stateByName1);
                    Type type4 = stateByName1.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    dataTableFromList6.TableName = "BillToState";
                    dataSet.Tables.Add(dataTableFromList6);
                }

                State stateByName2 = this.UnitOfWork.GetTypedRepository<IStateRepository>().GetStateByName(customerOrder.ShipTo?.State?.Name);
                if (stateByName2 != null)
                {
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) stateByName2);
                    Type type4 = stateByName2.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    dataTableFromList6.TableName = "ShipToState";
                    dataSet.Tables.Add(dataTableFromList6);
                }

                Country countryByName1 = this.UnitOfWork.GetTypedRepository<ICountryRepository>().GetCountryByName(customerOrder.Customer?.Country?.Name);
                if (countryByName1 != null)
                {
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) countryByName1);
                    Type type4 = countryByName1.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    dataTableFromList6.TableName = "BillToCountry";
                    dataSet.Tables.Add(dataTableFromList6);
                }

                Country countryByName2 = this.UnitOfWork.GetTypedRepository<ICountryRepository>().GetCountryByName(customerOrder.ShipTo?.Country?.Name);
                if (countryByName2 != null)
                {
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) countryByName2);
                    Type type4 = countryByName2.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    dataTableFromList6.TableName = "ShipToCountry";
                    dataSet.Tables.Add(dataTableFromList6);
                }

                DataTable dataTableFromList7 =
                    ObjectHelper_Morsco.GetDataTableFromList((IList) Enumerable.ToList<CustomProperty>((IEnumerable<CustomProperty>) customerOrder.CustomProperties),
                        typeof(CustomProperty), "ParentId", new Guid?(customerOrder.Id));
                dataTableFromList7.TableName = "CustomerOrderProperty";
                dataSet.Tables.Add(dataTableFromList7);

                dataSet.Tables.Add(ObjectHelper_Morsco.GetDataTableFromList((IList) Enumerable.ToList<OrderLine>((IEnumerable<OrderLine>) customerOrder.OrderLines),
                    typeof(OrderLine), "CustomerOrderId", new Guid?(customerOrder.Id)));

                dataSet.Tables["OrderLine"].Columns.Add("DollarOffOrder", typeof(Decimal));
                dataSet.Tables["OrderLine"].Columns.Add("DollarOffShipping", typeof(Decimal));
                dataSet.Tables["OrderLine"].Columns.Add("PercentOffOrder", typeof(Decimal));
                dataSet.Tables["OrderLine"].Columns.Add("PercentOffShipping", typeof(Decimal));
                dataSet.Tables["OrderLine"].Columns.Add("ProductDiscount", typeof(Decimal));
                dataSet.Tables["OrderLine"].Columns.Add("PromotionResultName", typeof(string));
                dataSet.Tables["OrderLine"].Columns.Add("ProductDiscountPerEach", typeof(Decimal));

                foreach (OrderLine orderLine1 in (IEnumerable<OrderLine>) customerOrder.OrderLines)
                {
                    OrderLine orderLine = orderLine1;
                    DataTable dataTableFromList6 =
                        ObjectHelper_Morsco.GetDataTableFromList((IList) Enumerable.ToList<CustomProperty>((IEnumerable<CustomProperty>) orderLine.CustomProperties),
                            typeof(CustomProperty), "ParentId", new Guid?(orderLine.Id));
                    dataTableFromList6.TableName = "OrderLineProperty";
                    dataSet.Merge(dataTableFromList6);
                    DataRow dataRow1 = Enumerable.FirstOrDefault<DataRow>((IEnumerable<DataRow>) DataTableExtensions.AsEnumerable(dataSet.Tables["OrderLine"]),
                        (Func<DataRow, bool>) (r => DataRowExtensions.Field<Guid>(r, "Id").Equals(orderLine.Id)));
                    if (dataRow1 != null)
                    {
                        if (orderLine.PromotionResult == null)
                        {
                            dataRow1["DollarOffOrder"] = (object) 0;
                            dataRow1["DollarOffShipping"] = (object) 0;
                            dataRow1["PercentOffOrder"] = (object) 0;
                            dataRow1["PercentOffShipping"] = (object) 0;
                            dataRow1["PromotionResultName"] = (object) string.Empty;
                            dataRow1["ProductDiscount"] = (object) 0;
                            dataRow1["ProductDiscountPerEach"] = (object) 0;
                        }
                        else
                        {
                            IPromotionResultService promotionResultService =
                                DependencyLocator.Current.GetInstance<IPromotionResultServiceFactory>().GetPromotionResultService(orderLine.PromotionResult);
                            dataRow1["DollarOffOrder"] = (object) promotionResultService.AmountOffOrder(orderLine.CustomerOrder);
                            dataRow1["DollarOffShipping"] = (object) promotionResultService.AmountOffShipping(orderLine.CustomerOrder);
                            dataRow1["PercentOffOrder"] = (object) promotionResultService.PercentOffOrder(orderLine.CustomerOrder);
                            dataRow1["PercentOffShipping"] = (object) promotionResultService.PercentOffShipping(orderLine.CustomerOrder);
                            dataRow1["PromotionResultName"] = (object) orderLine.PromotionResult.PromotionResultType;
                            Decimal num = promotionResultService.ProductDiscount(orderLine.CustomerOrder);
                            dataRow1["ProductDiscount"] = (object) num;
                            dataRow1["ProductDiscountPerEach"] = !(num > Decimal.Zero)
                                ? (object) 0
                                : (object) NumberHelper.RoundCurrency(num/orderLine.QtyOrdered);
                        }
                    }

                    if (orderLine.OrderLineConfigurationValues.Count > 0)
                    {
                        if (!dataSet.Tables["OrderLine"].Columns.Contains("Revision"))
                            dataSet.Tables["OrderLine"].Columns.Add("Revision");
                        DataRow dataRow2 =
                            Enumerable.FirstOrDefault<DataRow>((IEnumerable<DataRow>) DataTableExtensions.AsEnumerable(dataSet.Tables["OrderLine"]),
                                (Func<DataRow, bool>) (r => DataRowExtensions.Field<Guid>(r, "Id").Equals(orderLine.Id)));
                        if (dataRow2 != null)
                            dataRow2["Revision"] = (object) orderLine.Product.ConfigurationObject.Revision;
                        DataTable table = new DataTable("OrderLineConfigurationValue");
                        table.Columns.Add("OrderLineConfigurationValueId", typeof(Guid));
                        table.Columns.Add("OrderLineId", typeof(Guid));
                        table.Columns.Add("PageSequence", typeof(int));
                        table.Columns.Add("OptionSequence", typeof(int));
                        table.Columns.Add("InputName");
                        table.Columns.Add("InputValue");
                        table.Columns.Add("PriceImpact", typeof(Decimal));
                        foreach (
                            OrderLineConfigurationValue configurationValue in
                                (IEnumerable<OrderLineConfigurationValue>)
                                    Enumerable.ThenBy<OrderLineConfigurationValue, int>(
                                        Enumerable.OrderBy<OrderLineConfigurationValue, int>(
                                            (IEnumerable<OrderLineConfigurationValue>) orderLine.OrderLineConfigurationValues,
                                            (Func<OrderLineConfigurationValue, int>) (x => x.PageSequence)),
                                        (Func<OrderLineConfigurationValue, int>) (x => x.OptionSequence)))
                            table.Rows.Add((object) configurationValue.Id, (object) orderLine.Id, (object) configurationValue.PageSequence,
                                (object) configurationValue.OptionSequence, (object) configurationValue.ConfigurationOption.Name,
                                (object) configurationValue.OptionValue, (object) configurationValue.PriceImpact);
                        dataSet.Merge(table);
                    }

                    if (orderLine.Product != null)
                    {
                        ArrayList arrayList4 = new ArrayList();
                        arrayList4.Add((object) orderLine.Product);
                        Type type4 = orderLine.Product.GetType();
                        DataTable dataTableFromList8 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                        dataTableFromList8.TableName = "Product";
                        dataSet.Merge(dataTableFromList8);
                        DataTable dataTableFromList9 =
                            ObjectHelper_Morsco.GetDataTableFromList(
                                (IList) Enumerable.ToList<CustomProperty>((IEnumerable<CustomProperty>) orderLine.Product.CustomProperties),
                                typeof(CustomProperty), "ProductId", new Guid?(orderLine.Product.Id));
                        dataTableFromList9.TableName = "ProductProperty";
                        dataSet.Merge(dataTableFromList9);
                        if (orderLine.Product.Vendor != null)
                        {
                            ArrayList arrayList5 = new ArrayList();
                            arrayList5.Add((object) orderLine.Product.Vendor);
                            Type type5 = orderLine.Product.Vendor.GetType();
                            DataTable dataTableFromList10 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList5, type5);
                            dataTableFromList10.TableName = "Vendor";
                            dataSet.Merge(dataTableFromList10);
                        }
                    }
                }

                List<GiftCardTransaction> list =
                    Enumerable.ToList<GiftCardTransaction>(
                        (IEnumerable<GiftCardTransaction>)
                            Queryable.Where<GiftCardTransaction>(this.UnitOfWork.GetRepository<GiftCardTransaction>().GetTable(),
                                (Expression<Func<GiftCardTransaction, bool>>) (x => x.CustomerOrderId == (Guid?) customerOrder.Id)));
                dataSet.Tables.Add(ObjectHelper_Morsco.GetDataTableFromList((IList) list, typeof(GiftCardTransaction), "CustomerOrderId", new Guid?(customerOrder.Id)));
                dataSet.Tables.Add(ObjectHelper_Morsco.GetDataTableFromList((IList) Enumerable.ToList<Promotion>((IEnumerable<Promotion>) customerOrder.Promotions),
                    typeof(Promotion), "CustomerOrderId", new Guid?(customerOrder.Id)));

                DataTable dataTableFromList11 =
                    ObjectHelper_Morsco.GetDataTableFromList(
                        (IList) Enumerable.ToList<CreditCardTransaction>((IEnumerable<CreditCardTransaction>) customerOrder.CreditCardTransactions),
                        typeof(CreditCardTransaction), "CustomerOrderId", new Guid?(customerOrder.Id));
                if (this.UnitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<bool>("SubmitAllPaymentInfo"))
                {
                    dataSet.Tables.Add(dataTableFromList11);
                }
                else
                {
                    DataTable table = dataTableFromList11.Clone();
                    foreach (
                        DataRow row in
                            dataTableFromList11.Select(
                                "Result = '0' AND (TransactionType = 'S' OR TransactionType = 'D' OR TransactionType = 'C' OR TransactionType = 'V')"))
                        table.ImportRow(row);
                    dataSet.Tables.Add(table);
                }

                if (customerOrder.ShipVia != null)
                {
                    DataTableCollection tables3 = dataSet.Tables;
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) customerOrder.ShipVia);
                    Type type4 = customerOrder.ShipVia.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    tables3.Add(dataTableFromList6);
                }

                if (customerOrder.Affiliate != null)
                {
                    DataTableCollection tables3 = dataSet.Tables;
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) customerOrder.Affiliate);
                    Type type4 = customerOrder.Affiliate.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    tables3.Add(dataTableFromList6);
                }

                if (customerOrder.DropShipCustomer != null)
                {
                    ArrayList arrayList4 = new ArrayList();
                    arrayList4.Add((object) customerOrder.DropShipCustomer);
                    Type type4 = customerOrder.DropShipCustomer.GetType();
                    DataTable dataTableFromList6 = ObjectHelper_Morsco.GetDataTableFromList((IList) arrayList4, type4);
                    dataTableFromList6.TableName = "DropShip";
                    dataSet.Tables.Add(dataTableFromList6);
                }
                return dataSet;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
