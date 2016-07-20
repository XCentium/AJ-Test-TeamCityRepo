using Morsco.Customizations.Lib.EntityFramework.Model;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface ICreditCardRepository
    {
	    UserRecentlyUsedCreditCard GetMostRecentlyUsedCreditCard(string userId, string billToId);

	    UserRecentlyUsedCreditCard InsertUpdateRecentlyUsedCreditCard(string userId, string elementAccountId, string billToId);
    }
}
