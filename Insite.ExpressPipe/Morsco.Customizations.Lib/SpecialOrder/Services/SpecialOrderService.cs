using System.Collections.Generic;
using System.Threading.Tasks;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using System.Net.Http;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Morsco.Customizations.Lib.SpecialOrder.Models;
using Morsco.Customizations.Lib.SpecialOrder.Interfaces;

namespace Morsco.Customizations.Lib.SpecialOrder.Services
{
    public class SpecialOrderService : ServiceBase, ISpecialOrderService, IInterceptable, IDependency
    {
        private readonly ISpecialOrderRepository _repository;

        public SpecialOrderService(IUnitOfWorkFactory unitOfWorkFactory, ITranslationLocalizer translationLocalizer, ISpecialOrderRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<SpecialOrderResult> CreateSpecialOrder(SpecialOrderRequest request, HttpRequestMessage httpRequest)
        {

            var result = await Task.FromResult<SpecialOrderResult>(
                _repository.CreateSpecialOrder(request,  httpRequest));
            
            return result;
        }

        public async Task<SpecialOrderResult> CreateMultipleSpecialOrder(List<SpecialOrderRequest> request, HttpRequestMessage httpRequest)
        {

            var result = await Task.FromResult<SpecialOrderResult>(
                _repository.CreateMultipleSpecialOrder(request, httpRequest));

            return result;
        }

        public async Task<bool> DeleteQuote(string quoteId, HttpRequestMessage httpRequest)
        {
            var result = await Task.FromResult<bool>(
                _repository.DeleteQuote(quoteId, httpRequest));

            return result;
        }

        public async Task<bool> UpdateQuote(UpdateQuoteRequest request, HttpRequestMessage httpRequest)
        {
            var result = await Task.FromResult<bool>(
                _repository.UpdateQuote(request, httpRequest));

            return result;
        }

		public async Task<bool> RemoveQuoteLine(string quoteLineId, HttpRequestMessage httpRequest)
		{
			var result = await Task.FromResult<bool>(
				_repository.RemoveQuoteLine(quoteLineId, httpRequest));

			return result;
		}
    }
}

