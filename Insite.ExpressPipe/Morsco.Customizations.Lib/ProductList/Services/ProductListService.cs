using System.Threading.Tasks;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.ProductList.Interfaces;
using Morsco.Customizations.Lib.ProductList.Models;
using Insite.Catalog.Services.Results;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;

namespace Morsco.Customizations.Lib.ProductList.Services
{
    public class ProductListService : ServiceBase, IProductListService, IInterceptable
    { 
        private readonly IProductListRepository _repository;

        public ProductListService(IUnitOfWorkFactory unitOfWorkFactory, ITranslationLocalizer translationLocalizer,
            IProductListRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<GetProductCollectionResult> GetProductList(ProductListRequest request)
        {
            var result = new GetProductCollectionResult();


            result = await Task.FromResult<GetProductCollectionResult>(
                
                _repository.GetProductList(request.ListType, request.CustomerNumber, request.CustomerSequence, request.MaxRows)
            );
            
            return result;
        }
    }
}
