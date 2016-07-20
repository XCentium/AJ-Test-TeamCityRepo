using System;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.Registration.Interfaces;
using System.Threading.Tasks;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Morsco.Customizations.Lib.Registration.Models;

namespace Morsco.Customizations.Lib.Registration.Services
{
    public class RegistrationService : ServiceBase, IRegistrationService, IInterceptable
    {
        private readonly IRegistrationRepository _repository;

        public RegistrationService(IUnitOfWorkFactory unitOfWorkFactory, IRegistrationRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<SearchCustomerResult> SearchCustomer(SearchCustomerRequest request)
        {
            return await Task.FromResult(_repository.SearchCustomer(request.CustomerNumber));
        }

        public async Task<GetWarehousesResult> GetWarehouses()
        {
            return await Task.FromResult(_repository.GetWarehouses());
        }

        public async Task<Boolean> UserEmailExists(string userEmail)
        {
            return await Task.FromResult(_repository.UserEmailExists(userEmail));
        }
    }
}
