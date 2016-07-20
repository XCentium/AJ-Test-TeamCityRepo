using System;
using System.Threading.Tasks;
using Morsco.Customizations.Lib.Registration.Models;

namespace Morsco.Customizations.Lib.Registration.Interfaces
{
    public interface IRegistrationService
    {
        Task<SearchCustomerResult> SearchCustomer(SearchCustomerRequest request);
        Task<GetWarehousesResult> GetWarehouses();
        Task<Boolean> UserEmailExists(string userEmail);
    }
}

