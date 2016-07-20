using System;
using System.Linq;
using Insite.Catalog.Services;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using Insite.Core.Context;
using Insite.Plugins.Data;
using Morsco.Customizations.Lib.EntityFramework.Model;

namespace Morsco.Customizations.Lib.Repositories
{
    public class CreditCardRepository : BaseRepository, ICreditCardRepository, IInterceptable, IDependency
    {
        private const bool IgnoreCase = true;

        public CreditCardRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService)
            : base(unitOfWorkFactory, customerService, productService)
        { }

	    public UserRecentlyUsedCreditCard GetMostRecentlyUsedCreditCard(string userId, string billToId)
	    {
			UserRecentlyUsedCreditCard row = null;
	        var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
			row = unitOfWork.GetRepository<UserRecentlyUsedCreditCard>()
				.GetTable()
				.FirstOrDefault(x => x.BillToId == billToId && x.UserId == userId);

		    return row;
	    }

		public UserRecentlyUsedCreditCard InsertUpdateRecentlyUsedCreditCard(string userId, string elementAccountId, string billToId)
	    {
		    var row = GetMostRecentlyUsedCreditCard(userId, billToId);
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();

            if (row != null)
		    {
			    row.ElementAccountId = elementAccountId;
		    }
		    else
		    {
			    row = new UserRecentlyUsedCreditCard()
			    {
				    BillToId = billToId,
				    UserId = userId,
				    ElementAccountId = elementAccountId,
				    CreatedBy = SiteContext.Current.UserProfile.UserName,
				    CreatedOn = DateTimeOffset.Now,
				    ModifiedBy = SiteContext.Current.UserProfile.UserName,
				    ModifiedOn = DateTimeOffset.Now
                };

			    unitOfWork.GetRepository<UserRecentlyUsedCreditCard>()
				    .Insert(row);
		    }

		    unitOfWork.Save();

			return GetMostRecentlyUsedCreditCard(userId, billToId);
	    }

    }
}
