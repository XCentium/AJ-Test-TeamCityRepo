using Insite.Catalog.WebApi.V1.ApiModels;
using Morsco.Customizations.Lib.BulkUpload.Models;
using System.Net.Http;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.BulkUpload.Interfaces
{
    public interface IBulkUploadService
    {
        Task<ProductCollectionModel> GetBulkUploadProducts(BulkUploadRequest request, HttpRequestMessage httpRequest);
    }
}

