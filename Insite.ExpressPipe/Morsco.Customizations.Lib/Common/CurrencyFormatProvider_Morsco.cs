using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Data.Entities;
using Insite.Data.Repositories.Interfaces;
using System;

namespace Morsco.Customizations.Lib.Common
{
	public class CurrencyFormatProvider_Morsco : ICurrencyFormatProvider, IDependency
	{
		//protected readonly IUnitOfWork UnitOfWork;
		protected readonly IUnitOfWorkFactory UnitOfWorkFactory;
		private Currency defaultCurrency;
		protected Currency DefaultCurrency
		{
			get
			{
				if (defaultCurrency == null)
				{
					// This is the point of this customization: We are using unitofworkfactory because dbcontext used by unitofwork appears to be disposed
					var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
					defaultCurrency = unitOfWork.GetTypedRepository<ICurrencyRepository>().GetDefault();
				}

				return defaultCurrency;
			}
		}

		public CurrencyFormatProvider_Morsco(IUnitOfWorkFactory unitOfWorkFactory)
		{
			this.UnitOfWorkFactory = unitOfWorkFactory;
			//this.UnitOfWork = unitOfWorkFactory.GetUnitOfWork();
		}

		public string GetString(decimal amount, Currency currency)
		{
			if (currency != null)
			{
				return currency.CurrencySymbol + amount.ToString("#,##0.00");
			}

			if (DefaultCurrency != null)
			{
				return DefaultCurrency.CurrencySymbol + amount.ToString("#,##0.00");
			}
				
			return "$" + amount.ToString("#,##0.00");
		}
	}
}
