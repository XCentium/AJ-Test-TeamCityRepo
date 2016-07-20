using System.Threading.Tasks;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Services;
using System.IO;
using Morsco.Customizations.Lib.HistoryServices.Interfaces;
using Morsco.Customizations.Lib.HistoryServices.Models;


namespace Morsco.Customizations.Lib.HistoryServices.Services
{
    public class HistoryService : ServiceBase, IHistoryService, IInterceptable
    {
        private readonly IHistoryRepository _repository;

        public HistoryService(IUnitOfWorkFactory unitOfWorkFactory, IHistoryRepository repository)
            : base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        //TODO: Remove if this passes testing
        //public Task<DataTable> GetPurchasedProducts(GetPurchasedProductsRequest rqst)
        //{
        //    var result = Task.FromResult(_repository.GetPurchasedProducts(rqst));
        //    return result;
        //}

        public Task<string> GetAgingBuckets(GetAgingBucketsRequest rqst)
        {
            var result = Task.FromResult(_repository.GetAgingBuckets(rqst));
            return result;
        }

        public Task<string> GetShipments(GetShipmentsRequest rqst)
        {
            var result = Task.FromResult(_repository.GetShipments(rqst));
            return result;
        }

        public Task<string> GetOrderHistoryLines(GetOrderHistoryLinesRequest rqst)
        {
            var result = Task.FromResult(_repository.GetOrderHistoryLines(rqst));
            return result;
        }

        public Task<MemoryStream> DownloadInvoicesCsvByIdList(DownloadInvoicesRequest rqst)
        {
            var result = Task.FromResult(_repository.DownloadInvoicesCsvByIdList(rqst));
            return result;
        }
    }
}

