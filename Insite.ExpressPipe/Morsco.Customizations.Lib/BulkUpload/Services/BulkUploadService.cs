using Insite.Catalog.WebApi.V1.ApiModels;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Localization;
using Insite.Core.Plugins.Content;
using Insite.Core.Services;
using Morsco.Customizations.Lib.BulkUpload.Interfaces;
using Morsco.Customizations.Lib.BulkUpload.Models;
using Morsco.Customizations.Lib.Interfaces;
using System.Net.Http;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.BulkUpload.Services
{
    public class BulkUploadService : ServiceBase, IBulkUploadService, IInterceptable, IDependency
    {
        private readonly IBulkUploadRepository _repository;

        public BulkUploadService(IUnitOfWorkFactory unitOfWorkFactory, IContentProvider contextProvider, ITranslationLocalizer translationLocalizer,
            IBulkUploadRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<ProductCollectionModel> GetBulkUploadProducts(BulkUploadRequest request, HttpRequestMessage httpRequest)
        {

            var result = await Task.FromResult<ProductCollectionModel>(
                _repository.GetBulkUploadProducts(request, httpRequest));
            
            return result;
        }
    }
}

