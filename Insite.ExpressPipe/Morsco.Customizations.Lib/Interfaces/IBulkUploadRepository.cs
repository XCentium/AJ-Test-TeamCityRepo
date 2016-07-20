using Insite.Catalog.WebApi.V1.ApiModels;
using Morsco.Customizations.Lib.BulkUpload.Models;
using System.Net.Http;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IBulkUploadRepository
    {
        ProductCollectionModel GetBulkUploadProducts(BulkUploadRequest sopRequest, HttpRequestMessage httpRequest);
    }
}
