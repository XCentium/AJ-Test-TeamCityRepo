using Insite.Account.Services;
using Insite.Account.Services.Handlers.Helpers;
using Insite.Account.Services.Parameters;
using Insite.Account.Services.Results;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Emails;
using Insite.Core.Interfaces.Plugins.Security;
using Insite.Core.Plugins.Cart;
using Insite.Customers.Services;
using System;
using System.Linq;
using Insite.Account.Services.Handlers;
using Insite.Core.Context;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Customers.Services.Parameters;
using Insite.Data;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using WebGrease.Css.Extensions;

namespace Morsco.Customizations.Lib.Handlers
{
    // We're overriding AddAccountHandler so use same dependency name
    [DependencyName("AddAccountHandler")]
    public class AddAccountHandler_Morsco : AddAccountHandler
    {
        private const string IsNewRegistration = "IsNewRegistration";

        public AddAccountHandler_Morsco(Lazy<IAuthenticationService> authenticationService, Lazy<IEmailService> emailService, ICustomerService customerService,
            ISessionService sessionService, ICartOrderProviderFactory cartOrderProviderFactory, IAccountHelper accountHelper,
            Lazy<ICustomerOrderUtilities> customerOrderUtilities )
            : base(authenticationService, emailService, customerService, sessionService, cartOrderProviderFactory, accountHelper, customerOrderUtilities)
        { }

        //public override AddAccountResult Execute(IUnitOfWork unitOfWork, AddAccountParameter parameter, AddAccountResult result)
        //{
        //    var hasUserProfile = SiteContext.Current.UserProfile != null;
        //    if (hasUserProfile && !this.AccountHelper.RolesThatCanAddUsers.Any<string>(role => SiteContext.Current.IsUserInRole(role)))
        //    {
        //        return this.CreateErrorServiceResult<AddAccountResult>(result, SubCode.Forbidden, MessageProvider.Current.Forbidden);
        //    }

        //    if (parameter.IsGuest)
        //    {
        //        parameter.UserName = Guid.NewGuid().ToString();
        //        parameter.Email = parameter.UserName + "@guest.com";
        //        parameter.Password = AuthenticationService.Value.GeneratePassword();
        //    }

        //    result = ValidateParameters(unitOfWork, parameter, result);
        //    if (result.ResultCode != ResultCode.Success)
        //        return result;

        //    var typedRepository = unitOfWork.GetTypedRepository<IUserProfileRepository>();
        //    var userProfile = typedRepository.Create();
        //    userProfile.UserName = parameter.UserName;
        //    userProfile.Email = parameter.Email;
        //    userProfile.IsGuest = parameter.IsGuest;
        //    userProfile.FirstName = parameter.FirstName ?? string.Empty;
        //    userProfile.LastName = parameter.LastName ?? string.Empty;

        //    if (!hasUserProfile && SiteContext.Current.Currency != null)
        //        userProfile.CurrencyId = SiteContext.Current.Currency.Id;

        //    AuthenticationService.Value.CreateUser(userProfile.UserName, userProfile.Email, parameter.Password);

        //    typedRepository.Insert(userProfile);

        //    if ((parameter.IsSubscribed.HasValue ? (parameter.IsSubscribed.GetValueOrDefault() ? 1 : 0) : 0) != 0)
        //        EmailService.Value.SubscribeEmailToList("SubscriptionEmail", userProfile.Email, unitOfWork);

        //    result.UserProfile = userProfile;

        //    var num = parameter.IsSubscribed.HasValue ? (parameter.IsSubscribed.GetValueOrDefault() ? 1 : 0) : 0;
        //    result.IsSubscribed = num != 0;

        //    result.Password = parameter.Password;

        //    if (hasUserProfile)
        //        return AddAccountForUserAdministration(unitOfWork, parameter, result, userProfile);

        //    return FinishAddAccount(unitOfWork, parameter, result, userProfile);
        //}

        protected override AddAccountResult FinishAddAccount(IUnitOfWork unitOfWork, AddAccountParameter parameter, AddAccountResult result, UserProfile userProfile)
        {
            var configuration = unitOfWork.DataProvider.GetConfiguration();
            unitOfWork.DataProvider.SetConfiguration(new DataProviderConfiguration(configuration)
            {
                ValidationEnabled = false
            });

            var customerService = CustomerService;
            var parameter1 = new AddBillToParameter
            {
                Email = parameter.IsGuest ? string.Empty : parameter.Email,
                IsGuest = parameter.IsGuest
            };

            var addBillToResult = customerService.AddBillTo(parameter1);
            if (addBillToResult.ResultCode != ResultCode.Success)
                return CreateErrorServiceResult(result, addBillToResult.SubCode, addBillToResult.Message);

            var billTo = addBillToResult.BillTo;
            if (SiteContext.Current.Currency != null)
            {
                billTo.CurrencyId = SiteContext.Current.Currency.Id;
                addBillToResult.BillTo.CurrencyCode = SiteContext.Current.Currency.CurrencyCode;
            }

            userProfile.Customers.Add(billTo);
            result.BillTo = billTo;
            result.ShipTo = billTo;

            var cartOrder = CartOrderProviderFactory.GetCartOrderProvider().GetCartOrder();
            if (cartOrder != null)
            {
                cartOrder.InitiatedByUserProfile = userProfile;
                cartOrder.PlacedByUserProfile = userProfile;
                cartOrder.PlacedByUserName = userProfile.UserName;
                cartOrder.Customer = billTo;
                var customerOrderUtilities1 = CustomerOrderUtilities.Value;
                var customerOrder1 = cartOrder;
                var customer = customerOrder1.Customer;
                customerOrderUtilities1.SetBillTo(customerOrder1, customer);
                cartOrder.ShipTo = billTo;
                var customerOrderUtilities2 = CustomerOrderUtilities.Value;
                var customerOrder2 = cartOrder;
                var shipTo = customerOrder2.ShipTo;
                customerOrderUtilities2.SetShipTo(customerOrder2, shipTo);
            }
            unitOfWork.Save();

            unitOfWork.DataProvider.SetConfiguration(configuration);

            //Customization point:  Don't want to add a session if this is a new registration.
            if (parameter.Properties.ContainsKey(IsNewRegistration)
                && parameter.Properties[IsNewRegistration].Equals("true", StringComparison.CurrentCultureIgnoreCase))
            {
                result = HandleNewRegistrations(parameter, result);
            }
            else
            {
                var addSessionResult = SessionService.AddSession(new AddSessionParameter(parameter.UserName, parameter.Password));
                if (addSessionResult.ResultCode != ResultCode.Success)
                    return CreateErrorServiceResult(result, addSessionResult.SubCode, addSessionResult.Message);
            }

            return NextHandler.Execute(unitOfWork, parameter, result);
        }

        private AddAccountResult HandleNewRegistrations(AddAccountParameter parameter, AddAccountResult result)
            {

                var profile = result.UserProfile;

                //Add any properties except New Registration
                parameter.Properties.Where(x => !x.Key.Equals(IsNewRegistration))
                    .ForEach(x => profile.SetProperty(x.Key, x.Value));

                //Registration Administrator will search on position to identify new registrations to work.
                profile.Position = "New Registration";

                // User is Buyer3
                AccountHelper.AddRole(profile, "buyer3");

                //When testing, we discovered customers assigned -- probably depending on how logged in when running Swagger from UI
                //But can't be too careful
                profile.Customers.ToList().ForEach(x => AccountHelper.UnassignCustomer(profile, x));

                return result;
            }
        }
}
