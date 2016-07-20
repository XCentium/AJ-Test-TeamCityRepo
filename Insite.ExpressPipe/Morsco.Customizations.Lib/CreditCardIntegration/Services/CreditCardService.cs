using Insite.Core.Services;
using Morsco.Customizations.Lib.CreditCardIntegration.Interfaces;
using Morsco.Customizations.Lib.CreditCardIntegration.Models;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Insite.Common.Logging;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Services;

namespace Morsco.Customizations.Lib.CreditCardIntegration.Services
{
    public class CreditCardService : ServiceBase, ICreditCardService, IInterceptable
    {
        private readonly ICreditCardRepository _creditCardRepository;
		private readonly ContactServices _ponderosaContactServices;
		private readonly CreditCardServices _ponderosaCreditCardServices;
        private const bool ContactMustExist = true;

        //Customer at ship-to level, or bill-to level
        private string ChosenCustomerId
        {
            get
            {
                var ctx = SiteContext.Current;
                var customerIdentifier = !string.IsNullOrWhiteSpace(ctx.ShipTo.CustomerSequence) ? ctx.ShipTo.CustomerSequence : ctx.ShipTo.CustomerNumber;
                if (string.IsNullOrWhiteSpace(customerIdentifier))
                {
                    throw new Exception($"Could not get the customer identifier.  CustomerNumber({ctx.ShipTo.CustomerSequence}), CustomerSequence({ctx.ShipTo.CustomerSequence})");
                }
                int temp;
                if (!int.TryParse(customerIdentifier, out temp))
                {
                    throw new Exception("Non-numeric customer id found ({customerIdentifier})");
                }
                return customerIdentifier;
            }
        }

		public CreditCardService(IUnitOfWorkFactory unitOfWorkFactory, ITranslationLocalizer translationLocalizer, ICreditCardRepository creditCardRepository)
            :base(unitOfWorkFactory)
        {
            _creditCardRepository = creditCardRepository;
			_ponderosaContactServices = new ContactServices();
			_ponderosaCreditCardServices = new CreditCardServices();
        }
		
		public async Task<CreditCardsResult> GetUserCardList()
		{
		    var contactId = GetEclipseContactId(!ContactMustExist);

		    if (contactId.HasValue)
		    {
		        try
		        {
		            var listOfCards = await Task.FromResult<List<CreditCardEntity>>(
		                _ponderosaCreditCardServices.GetCreditCardList(contactId.Value, ChosenCustomerId)
		                );

		            listOfCards = DecodeCards(listOfCards);

		            SetMostRecentlyUsedCard(listOfCards);

		            return new CreditCardsResult
		            {
		                CreditCards = listOfCards,
                        Success = true
		            };
		        }
		        catch (Exception e)
		        {
                    LogHelper.ForType(typeof(CreditCardService)).Error( e.ToString());
		            throw;
		        }
		    }
		    else
		    {
		        return new CreditCardsResult()
		        {
		            CreditCards = new List<CreditCardEntity>(),
		            Success = true
		        };
		    }
		}

	    public async Task<CreditCardInitiateResult> InitiateAddNewCreditCard(AddCardRequest addCardRequest, string origin)
	    {
			var contactId = GetEclipseContactId(!ContactMustExist);
            var customerId = Convert.ToInt32(ChosenCustomerId);
            var userId = SiteContext.Current.UserProfile.Id;

	        var contactDictionary = GetContactDictionary(addCardRequest);
            contactDictionary[ContactConstants.Email] = GetCredentials().Login;

			try
			{
                if (!contactId.HasValue)
                {
                    contactId = CreateContact(contactDictionary, customerId);
                }
				
				contactDictionary[ContactConstants.ContactID] = contactId;

				var result = new CreditCardInitiateResult();
				var setupResult = await Task.FromResult<IDictionary<string, object>>(
					_ponderosaCreditCardServices.InitiateAddNewCreditCard(origin, contactDictionary)
				);

                result.SetupResult = setupResult[CreditCardConstants.Success].ToString();
                if (result.SetupResult.ToLower() == "true")
                {
                    result.RedirectUrl = setupResult[CreditCardConstants.RedirectURL].ToString();
                    result.ContactId = contactId.Value.ToString();
                }
                else
                {
                    result.ErrorMessage = setupResult["ErrorMessage"].ToString();
                }

				return result;
			} 
			catch (Exception e)
			{
                LogHelper.ForType(typeof(CreditCardService)).Error(e.ToString());
				throw;
			}
	    }

		private Dictionary<string, object> GetContactDictionary(AddCardRequest addCardRequest)
		{
			var user = new Dictionary<string, object>();

			user[ContactConstants.CardHolderName] = addCardRequest.CardHolderName;
			user[ContactConstants.BillingAddress] = addCardRequest.BillingAddress;
			user[ContactConstants.City] = addCardRequest.City;
			user[ContactConstants.State] = addCardRequest.State;
			user[ContactConstants.Zip] = addCardRequest.Zip;

			return user;
		}

		private int CreateContact(Dictionary<string, object> user, int customerId)
		{
			var mappedContact = _ponderosaContactServices.MapUserToContact(user, customerId);
			var result = _ponderosaContactServices.AddContact(mappedContact);
			return result;
		}

		public async Task<CreditCardsResult> FinalizeNewCreditCard(Dictionary<string, object> setupResult)
	    {
			var contactId = GetEclipseContactId(ContactMustExist);
			
            setupResult.Add(CreditCardConstants.ContactID, contactId.Value);
			
            var elementAccountId = await Task.FromResult<string>(
				_ponderosaCreditCardServices.FinalizeNewCreditCard(setupResult, SiteContext.Current.BillTo.Id.ToString())
			);

			var result = await StoreMostRecentlyUsedCard(elementAccountId);
		    //result.CreditCards = DecodeCards(result.CreditCards);

            return result;
	    }

	    public async Task<CreditCardsResult> DeleteCardFromContact(string elementAccountId)
	    {
            var contactId = GetEclipseContactId(ContactMustExist);


			var listOfCards = await Task.FromResult<List<CreditCardEntity>>(
				_ponderosaCreditCardServices.DeleteCardFromContact(contactId.Value, elementAccountId)
			);

            listOfCards = DecodeCards(listOfCards);
            SetMostRecentlyUsedCard(listOfCards);
            
            return new CreditCardsResult
	        {
	            CreditCards = listOfCards,
	            Success = true
	        };
	    }

	    public async Task<CreditCardsResult> StoreMostRecentlyUsedCard(string elementAccountId)
	    {

 			var serviceResult = await Task.FromResult<Boolean>(
                DoStoreMostRecentlyUsedCard(SiteContext.Current.UserProfile.Id.ToString(), elementAccountId, SiteContext.Current.BillTo.Id.ToString())
			);

            var contactId = GetEclipseContactId(ContactMustExist);

			var cards = await Task.FromResult<List<CreditCardEntity>>(
				_ponderosaCreditCardServices.GetCreditCardList(contactId.Value, ChosenCustomerId)
			);

            cards = DecodeCards(cards);
            SetMostRecentlyUsedCard(cards);

	        return new CreditCardsResult
	        {
	            CreditCards = cards,
	            Success = true
	        };
	    }

        private void SetMostRecentlyUsedCard(List<CreditCardEntity> cards)
        {
            var cc = _creditCardRepository.GetMostRecentlyUsedCreditCard(SiteContext.Current.UserProfile.Id.ToString(), SiteContext.Current.BillTo.Id.ToString());
            var elementAccountId = (cc != null) ? cc.ElementAccountId : string.Empty;

            var recent = cards.FirstOrDefault(x => x.ElementAcctID == elementAccountId)
                         ?? cards.OrderByDescending(x => x.ExpireDate.Substring(2, 2) + x.ExpireDate.Substring(0, 2)).FirstOrDefault();
            if (recent != null)
            {
                recent.IsSelectedCard = true;
            }
        }

        private Boolean DoStoreMostRecentlyUsedCard(string userId, string elementAccountId, string billToId)
	    {
			var cardRow = _creditCardRepository.InsertUpdateRecentlyUsedCreditCard(userId, elementAccountId, billToId);

			return cardRow != null;
	    }

        private List<CreditCardEntity> DecodeCards(List<CreditCardEntity> list)
        {
            //Cardholder  info is html-encoded by something in the ponderosa/eclipse/element process.  Need to decode.
            list.ForEach(x => x.CardHolder = HttpContext.Current.Server.HtmlDecode(x.CardHolder));
            return list;
        }

        private int? GetEclipseContactId(bool mustHaveValue)
        {
            var creds = GetCredentials();
		    var contactId = _ponderosaContactServices.GetContactId(creds.Login, creds.Password);

            if (mustHaveValue && contactId == 0)
            {
                throw new Exception("Expected ContactId does not exist for " + creds.Login);
            }

            return (contactId != 0) ? contactId : (int?)null;
        }

        private Credentials GetCredentials()
        {
            var ctx = SiteContext.Current;
            
            var email = !string.IsNullOrEmpty(ctx.UserProfile.Email) ? ctx.UserProfile.Email
                : ctx.UserProfile.UserName.IsEmailAddress() ? ctx.UserProfile.UserName 
                : ctx.UserProfile.UserName + "@unknown.com";

            return new Credentials(ChosenCustomerId + "." + email, "NotApplicable");
        }

        internal class Credentials
        {
            internal Credentials(string login, string password)
            {
                Login = login;
                Password = password;
            }
            internal string Login { get; set; }
            internal string Password { get; set; }
        }

	}
}