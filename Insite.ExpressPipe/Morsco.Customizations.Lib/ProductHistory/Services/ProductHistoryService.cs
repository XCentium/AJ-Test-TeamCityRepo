using System.Threading.Tasks;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.ProductHistory.Interfaces;
using Morsco.Customizations.Lib.ProductHistory.Models;
using Insite.Catalog.WebApi.V1.ApiModels;
using System.Net.Http;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;

namespace Morsco.Customizations.Lib.ProductHistory.Services
{
    public class ProductHistoryService : ServiceBase, IProductHistoryService, IInterceptable, IDependency
    {
        private readonly IProductHistoryRepository _repository;

        public ProductHistoryService(IUnitOfWorkFactory unitOfWorkFactory, ITranslationLocalizer translationLocalizer,
            IProductHistoryRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<ProductCollectionModel> GetPurchasedProducts(PurchasedProductsRequest request, HttpRequestMessage httpRequest)
        {
            var result = await Task.FromResult<ProductCollectionModel>(
                _repository.GetPurchasedProducts(request.Page, request.PerPage, request.SearchTerm, httpRequest));
            
            return result;
        }
    }
}

