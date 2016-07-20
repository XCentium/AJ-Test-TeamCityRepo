using System.Threading.Tasks;
using Morsco.Customizations.Lib.ProductHistory.Models;
using Insite.Catalog.WebApi.V1.ApiModels;
using System.Net.Http;

namespace Morsco.Customizations.Lib.ProductHistory.Interfaces
{
    public interface IProductHistoryService
    {
        Task<ProductCollectionModel> GetPurchasedProducts(PurchasedProductsRequest request, HttpRequestMessage httpRequest);
    }
}

