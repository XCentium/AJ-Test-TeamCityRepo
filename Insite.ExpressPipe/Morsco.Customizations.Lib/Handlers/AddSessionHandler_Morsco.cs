using System;
using System.Linq;
using Insite.Account.Services.Handlers;
using Insite.Account.Services.Parameters;
using Insite.Account.Services.Results;
using Insite.Cart.Services;
using Insite.Cart.Services.Parameters;
using Insite.Cart.Services.Results;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Plugins.Security;
using Insite.Core.Providers;
using Insite.Core.Services;
using Insite.Core.Services.Handlers;
using Insite.Customers.Services;
using Insite.Customers.Services.Parameters;
using Insite.Customers.Services.Results;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("AddSessionHandler_Morsco")]
    public class AddSessionHandler_Morsco : AddSessionHandler
    {
        public override int Order
        {
            get
            {
                return 100;
            }
        }

        public AddSessionHandler_Morsco(IAuthenticationService authenticationService, ICustomerService customerService, ICartService cartService, IHandlerFactory handlerFactory, ISiteContextServiceFactory siteContextServiceFactory)
            : base(authenticationService, customerService, cartService, handlerFactory, siteContextServiceFactory)
        {
        }

        public override AddSessionResult Execute(IUnitOfWork unitOfWork, AddSessionParameter parameter, AddSessionResult result)
        {
            var addSessionResult = CheckForErrorResult(unitOfWork, parameter, result);
            if (addSessionResult != null)
                return addSessionResult;

            AuthenticationService.SetUserAsAuthenticated(parameter.UserName);

            try
            {
                //Customization Point
                if (SiteContext.Current.UserProfile.Position == "New Registration")
                {
                    return CreateErrorServiceResult(result, SubCode.AccountServiceUserRoleRequiresApprover,
                        MessageProvider.Current.GetMessage("AccountServiceUnapprovedUser", "Your login has not yet been approved"));
                }

                //Customization Point
                var roles = AuthenticationService.GetRolesForUser(SiteContext.Current.UserProfile.UserName);
                if (roles == null || roles.Count == 0)
                {
                    return CreateErrorServiceResult(result, SubCode.GeneralFailure,
                        MessageProvider.Current.GetMessage("AccountServiceNoRoles", "Your login has no roles assigned"));
                }


                var billToCollection = CustomerService.GetBillToCollection(new GetBillToCollectionParameter());

                if (billToCollection.ResultCode != ResultCode.Success)
                    return CreateErrorServiceResult(result, billToCollection.SubCode, billToCollection.Message);

                var flag1 = false;
                var flag2 = billToCollection.GetBillToResults.Any();

                foreach (var getBillToResult in billToCollection.GetBillToResults)
                {
                    var collectionResult = GetShipToCollectionResult(getBillToResult.BillTo.Id);
                    if (collectionResult.ResultCode == ResultCode.Success && collectionResult.TotalCount > 0)
                    {
                        flag1 = true;
                        break;
                    }
                }

                var orCreateByName = unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>()
                    .GetOrCreateByName<bool>("AllowCreateNewShipToAddress", SiteContext.Current.Website.Id);

                if (!flag2 || !flag1 && !orCreateByName)
                    return CreateErrorServiceResult(result, SubCode.AccountServiceContactCustomerSupport, MessageProvider.Current.Contact_Customer_Support);

                unitOfWork.Save();

                var param = new UpdateCartParameter
                {
                    BillToId = SiteContext.Current.BillTo.Id,
                    ShipToId = SiteContext.Current.ShipTo != null ? SiteContext.Current.ShipTo.Id : SiteContext.Current.BillTo.Id
                };
                var updateCartResult = CartService.UpdateCart(param);

                if (updateCartResult.ResultCode != ResultCode.Success)
                    return CreateErrorServiceResult(result, updateCartResult.SubCode, updateCartResult.Message);

                unitOfWork.Save();

                SiteContextService.SetPersona(new Guid?(), true);

                result.GetSessionResult = HandlerFactory.GetHandler<IHandler<GetSessionParameter, GetSessionResult>>()
                    .Execute(unitOfWork, new GetSessionParameter(), new GetSessionResult());

                result.GetSessionResult.IsAuthenticated = true;
            }
            catch (Exception)
            {
                AuthenticationService.SignOut();
                throw;
            }
            return result;
        }

        protected override T CreateErrorServiceResult<T>(T result, SubCode subCode, string message = null)
        {
            AuthenticationService.SignOut();
            return base.CreateErrorServiceResult(result, subCode, message);
        }

        private GetShipToCollectionResult GetShipToCollectionResult(Guid billToId)
        {
            var parameter = new GetShipToCollectionParameter();
            parameter.BillToId = billToId;
            var num1 = 0;
            parameter.ExcludeBillTo = num1 != 0;
            var num2 = 1;
            parameter.ExcludeShowAll = num2 != 0;
            int? nullable1 = 1;
            parameter.StartPage = nullable1;
            int? nullable2 = 1;
            parameter.PageSize = nullable2;
            return CustomerService.GetShipToCollection(parameter);
        }

        private AddSessionResult CheckForErrorResult(IUnitOfWork unitOfWork, AddSessionParameter parameter, AddSessionResult result)
        {
            if (!parameter.IsExternalIdentity && !AuthenticationService.ValidateUser(parameter.UserName, parameter.Password))
                return CreateErrorServiceResult(result, SubCode.AccountServiceInvalidUserNameOrPassword, MessageProvider.Current.SignInInfo_UserNamePassword_Combination);
            var byUserName = unitOfWork.GetTypedRepository<IUserProfileRepository>().GetByUserName(parameter.UserName);
            if (byUserName == null)
                return CreateErrorServiceResult(result, SubCode.AccountServiceUserProfileNotFound, MessageProvider.Current.SignInInfo_UserNamePassword_Combination);
            if (byUserName.IsPasswordChangeRequired)
                return CreateErrorServiceResult(result, SubCode.PasswordExpired, MessageProvider.Current.SignInInfo_UserNamePassword_ChangeRequired);
            if (AuthenticationService.IsLockedOut(byUserName.UserName))
                return CreateErrorServiceResult(result, SubCode.LockedOut, MessageProvider.Current.SignInInfo_UserLockedOut);
            return null;
        }
    }
}
