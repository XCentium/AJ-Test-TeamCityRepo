using System;
using Morsco.Customizations.Lib.Registration.Models;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IRegistrationRepository
    {
        SearchCustomerResult SearchCustomer(string customerNumberOrSequence);
        GetWarehousesResult GetWarehouses();
        Boolean UserEmailExists(string userEmail);
    }
}
