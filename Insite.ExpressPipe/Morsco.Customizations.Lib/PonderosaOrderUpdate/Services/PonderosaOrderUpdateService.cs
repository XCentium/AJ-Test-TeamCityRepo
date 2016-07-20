using System.Threading.Tasks;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.PonderosaOrderUpdate.Interfaces;

namespace Morsco.Customizations.Lib.PonderosaOrderUpdate.Services
{
    public class PonderosaOrderUpdateService : ServiceBase, IPonderosaOrderUpdateService, IInterceptable
    {
        private readonly IPonderosaOrderUpdateRepository _repository;
        public PonderosaOrderUpdateService(IUnitOfWorkFactory unitOfWorkFactory, IPonderosaOrderUpdateRepository repository)
            : base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        //would have to return the return value
        public Task<bool> GetOrderChanges()
        {
            return Task.FromResult(_repository.GetOrderChanges());
        }
    }
}
