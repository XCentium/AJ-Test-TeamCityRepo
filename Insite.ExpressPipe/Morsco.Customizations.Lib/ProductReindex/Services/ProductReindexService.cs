using System;
using System.Threading.Tasks;
using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Search;
using Insite.Core.Services;
using Morsco.Customizations.Lib.ProductReindex.Interfaces;
using Morsco.Customizations.Lib.ProductReindex.Models;


namespace Morsco.Customizations.Lib.ProductReindex.Services
{
    public class ProductReindexService : ServiceBase, IProductReindexService, IInterceptable
    {
        private readonly IProductSearchIndexer _productSearchIndexer;
        public ProductReindexService(IUnitOfWorkFactory unitOfWorkFactory, IProductSearchIndexer productSearchIndexer)
            : base(unitOfWorkFactory)
        {
            _productSearchIndexer = productSearchIndexer;
        }


        public async Task<ProductReindexResult> Reindex(ProductReindexRequest request)
        {
            return await Task.FromResult(PerformReindex());
        }

        private ProductReindexResult PerformReindex()
        {
            try
            {
                LogHelper.For(this).Info("Product Search ReIndex Initiated. This process might take several minites to complete.");
                _productSearchIndexer.BuildProductSearchIndex();
                LogHelper.For(this).Info("Product Search ReIndex completed successfully.");
            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error(ex.Message, ex);
                throw ex;
            }
            return new ProductReindexResult() {ReindexCompleted = true};
        }

    }
}