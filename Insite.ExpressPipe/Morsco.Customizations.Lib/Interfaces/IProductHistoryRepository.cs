using System.Data;
using Insite.Catalog.WebApi.V1.ApiModels;
using System.Net.Http;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IProductHistoryRepository
    {
        ProductCollectionModel GetPurchasedProducts(int page, int perPage, string searchTerm, HttpRequestMessage httpRequest);
        DataTable SelectPurchasedProducts(int page, int perPage, string searchTerm);

    }
}
