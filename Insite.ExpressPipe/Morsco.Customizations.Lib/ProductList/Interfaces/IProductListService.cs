using System.Threading.Tasks;
using Morsco.Customizations.Lib.ProductList.Models;
using Insite.Catalog.Services.Results;

namespace Morsco.Customizations.Lib.ProductList.Interfaces
{
    public interface IProductListService
    {
        Task<GetProductCollectionResult> GetProductList(ProductListRequest request);
    }
}

