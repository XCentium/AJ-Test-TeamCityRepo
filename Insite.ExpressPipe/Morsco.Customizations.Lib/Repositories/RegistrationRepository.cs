using System;
using Insite.Catalog.Services;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using System.Linq;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Entities;
using Morsco.Customizations.Lib.Registration.Models;

namespace Morsco.Customizations.Lib.Repositories
{
    public class RegistrationRepository : BaseRepository, IRegistrationRepository, IInterceptable
    {
        public RegistrationRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService)
            : base(unitOfWorkFactory, customerService, productService)
        {
        }

	    public SearchCustomerResult SearchCustomer(string customerNumberOrSequence)
	    {
	        var result = new SearchCustomerResult();

	        var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
	        var cust = 
                unitOfWork.GetRepository<Customer>().GetTable()
	                   .FirstOrDefault(x => x.CustomerNumber == customerNumberOrSequence)
                ?? 
                unitOfWork.GetRepository<Customer>().GetTable()
                       .FirstOrDefault(x => x.CustomerSequence == customerNumberOrSequence);

	        if (cust != null)
	        {
                result.CustomerNumber = cust.CustomerNumber;
                result.CustomerSequence = cust.CustomerSequence;
                result.CompanyName = cust.CompanyName;
                result.Address1 = cust.Address1;
                result.Address2 = cust.Address2;
                result.City = cust.City;
                result.State = cust.State.Abbreviation;
                result.PostalCode = cust.PostalCode;
                result.Country = cust.Country.Abbreviation;
	        }

	        return result;
	    }

        public GetWarehousesResult GetWarehouses()
        {
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            return new GetWarehousesResult
            {
                Warehouses = unitOfWork.GetRepository<Warehouse>().GetTable()
                    .Where(x => x.DeactivateOn == null || x.DeactivateOn > DateTime.Now)
                    .Select(x => new WarehouseDto
                    {
                        WarehouseId = x.Id,
                        ShipSite = x.ShipSite,
                        Name = x.Name,
                        Description = x.Description
                    })
                    .ToList()
            };
        }

        public Boolean UserEmailExists(string userEmail)
        {
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            return unitOfWork.GetRepository<UserProfile>().GetTable()
                .Any(x => x.Email.Equals(userEmail, StringComparison.CurrentCultureIgnoreCase));
        }
    }
}
