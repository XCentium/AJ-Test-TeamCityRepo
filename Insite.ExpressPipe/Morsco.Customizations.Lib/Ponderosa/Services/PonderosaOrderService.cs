using System.Collections.Generic;
using System.Threading.Tasks;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.Ponderosa.Interfaces;
using Morsco.Customizations.Lib.Ponderosa.Models;

namespace Morsco.Customizations.Lib.Ponderosa.Services
{
    public class PonderosaOrderService : ServiceBase, IPonderosaOrderService, IInterceptable
    {
        private readonly IPonderosaOrderRepository _repository;

        public PonderosaOrderService(IUnitOfWorkFactory unitOfWorkFactory, IPonderosaOrderRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<List<Dictionary<string, object>>> GetOrder(OrderRequest request)
        {
            var result = await Task.FromResult(_repository.GetOrder(request.EclipseOrderNumber));
            
            return result;
        }

        public async Task<List<Dictionary<string, object>>> UpdateQuote(UpdateQuoteRequest request)
        {
            var result = await Task.FromResult(_repository.UpdateQuote(request));

            return result;
        }
    }
}

