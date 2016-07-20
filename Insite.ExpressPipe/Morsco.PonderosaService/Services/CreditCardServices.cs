using System.Collections.Generic;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Repositories;

namespace Morsco.PonderosaService.Services
{

    public class CreditCardServices
    {
		private readonly CreditCardRepository _creditCardRepository = new CreditCardRepository();

		public List<CreditCardEntity> GetCreditCardList(int contactId, string customerId)
	    {
			return _creditCardRepository.RunWithRetry<List<CreditCardEntity>>("GetCreditCardList", new object[] { contactId, customerId });
	    }

		public List<CreditCardEntity> DeleteCardFromContact(int contactId, string elementAccountId)
		{
            return _creditCardRepository.RunWithRetry<List<CreditCardEntity>>("DeleteCardFromContact", new object[] { contactId, elementAccountId });
		}

		public IDictionary<string, object> InitiateAddNewCreditCard(string origin, IDictionary<string, object> user)
		{
            return _creditCardRepository.RunWithRetry<IDictionary<string, object>>("InitiateAddNewCreditCard", new object[] {origin, user });
	    }

		public string FinalizeNewCreditCard(Dictionary<string, object> setupResult, string billToId)
	    {
            return _creditCardRepository.RunWithRetry<string>("FinalizeNewCreditCard", new object[] { setupResult, billToId });
	    }
	}
}