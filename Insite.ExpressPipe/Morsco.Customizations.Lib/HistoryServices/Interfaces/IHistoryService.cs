using System.Threading.Tasks;
using System.IO;
using Morsco.Customizations.Lib.HistoryServices.Models;

namespace Morsco.Customizations.Lib.HistoryServices.Interfaces
{
    public interface IHistoryService
    {
        //TODO: Remove if this passes testing
        //Task<DataTable> GetPurchasedProducts(GetPurchasedProductsRequest rqst);
        Task<string> GetAgingBuckets(GetAgingBucketsRequest rqst);
        Task<string> GetShipments(GetShipmentsRequest rqst);
        Task<string> GetOrderHistoryLines(GetOrderHistoryLinesRequest rqst);
        Task<MemoryStream> DownloadInvoicesCsvByIdList(DownloadInvoicesRequest rqst);
    }
}

