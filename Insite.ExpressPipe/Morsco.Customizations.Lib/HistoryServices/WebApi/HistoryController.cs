using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi;
using Morsco.Customizations.Lib.HistoryServices.Interfaces;
using Morsco.Customizations.Lib.HistoryServices.Models;

namespace Morsco.Customizations.Lib.HistoryServices.WebApi
{
    [RoutePrefix("api/morsco/History")]
    public class HistoryController : BaseApiController
    {
        private readonly IHistoryService _historyService;

        public HistoryController(ICookieManager cookieManager, IHistoryService historyService) 
            : base(cookieManager)
        {
            _historyService = historyService;
        }

        //TODO: Remove this and downstream after tests pass
        //[ResponseType(typeof(string)), Route("getPurchasedProducts")]
        //public async Task<string> Get([FromUri] GetPurchasedProductsRequest rqst)
        //{
        //    var x = await _historyService.GetPurchasedProducts(rqst);
        //    //TODO: THis isn't a string
        //    return x.ToString();
        //}

        [ResponseType(typeof(string)), Route("getAgingBuckets")]
        public async Task<string> Get([FromUri] GetAgingBucketsRequest rqst)
        {
            var x = await _historyService.GetAgingBuckets(rqst);
            return x;
        }

        [ResponseType(typeof(string)), Route("getShipments")]
        public async Task<string> Get([FromUri]GetShipmentsRequest rqst)
        {
            var x = await _historyService.GetShipments(rqst);
            return x;
        }

        [ResponseType(typeof(string)), Route("getOrderHistoryLines")]
        public async Task<string> Get([FromUri] GetOrderHistoryLinesRequest rqst)
        {
            var x = await _historyService.GetOrderHistoryLines(rqst);
            return x;
        }

        [ResponseType(typeof(HttpResponseMessage)), Route("downloadInvoicesCsvByIdList")]
        public async Task<HttpResponseMessage> Get([FromUri] DownloadInvoicesRequest rqst)
        {
            var stream = await _historyService.DownloadInvoicesCsvByIdList(rqst);

            var fileName = string.IsNullOrWhiteSpace(ConfigurationManager.AppSettings["Invoice_CSV_FileName"])
                ? "Invoices.csv"
                : ConfigurationManager.AppSettings["Invoice_CSV_FileName"];
 
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(stream)
            };

            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") {FileName = fileName};
            return response;
        }
    }
}
