using System.IO;
using Morsco.Customizations.Lib.HistoryServices.Models;

namespace Morsco.Customizations.Lib.HistoryServices.Interfaces
{
    public interface IHistoryRepository
    {
        //TODO: Remove if this passes testing
        //DataTable GetPurchasedProducts(GetPurchasedProductsRequest rqst);
        string GetAgingBuckets(GetAgingBucketsRequest rqst);
        string GetShipments(GetShipmentsRequest rqst);
        string GetOrderHistoryLines(GetOrderHistoryLinesRequest rqst);
        MemoryStream DownloadInvoicesCsvByIdList(DownloadInvoicesRequest rqst);
    }
}
