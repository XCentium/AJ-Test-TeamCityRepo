using Morsco.Customizations.Lib.CreditCardIntegration.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.CreditCardIntegration.Interfaces
{
    public interface ICreditCardService
    {

		Task<CreditCardsResult> GetUserCardList();

		Task<CreditCardInitiateResult> InitiateAddNewCreditCard(AddCardRequest addCardRequest, string origin);

		Task<CreditCardsResult> FinalizeNewCreditCard(Dictionary<string, object> setupResult);

		Task<CreditCardsResult> DeleteCardFromContact(string elementAccountId);

		Task<CreditCardsResult> StoreMostRecentlyUsedCard(string elementAccountId);
    }
}

