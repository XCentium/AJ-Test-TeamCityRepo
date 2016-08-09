using System;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Insite.Admin.AdminActions;
using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Interfaces.Exceptions;
using Insite.Core.Plugins.Search;
using Insite.Core.Services;
using Insite.Data.Entities;
using Morsco.Customizations.Lib.ProductReindex.Interfaces;
using Morsco.Customizations.Lib.ProductReindex.Models;


namespace Morsco.Customizations.Lib.ProductReindex.Services
{
    public class ProductReindexService : ServiceBase, IProductReindexService, IInterceptable
    {
        public ProductReindexService(IUnitOfWorkFactory unitOfWorkFactory, IProductSearchIndexer productSearchIndexer)
            : base(unitOfWorkFactory) {}
        
        public async Task<ProductReindexResult> Reindex(ProductReindexRequest request)
        {
            // at least temporarily,possible to run and get no parameters
            // defaults to values like we're using currently.
            request = request ?? new ProductReindexRequest();

            return await Task.FromResult(PerformReindex(request));
        }

        private ProductReindexResult PerformReindex(ProductReindexRequest request)
        {
            var result = new ProductReindexResult();

            try
            {
                //run job using WIS
                var rebuildAction = new RebuildProductSearchIndexAction(UnitOfWorkFactory);
                rebuildAction.Execute(null);

                if (request.WaitForCompletion)
                {
                    WaitForJobCompletion(request.WaitForCompletionTimeoutSec);
                }

            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error(ex.Message, ex);
                throw;
            }
            return new ProductReindexResult() {ReindexCompleted = true};
        }

        private void WaitForJobCompletion(int secondsToWait)
        {
            var jobDefinitionName = "Rebuild Search Index";
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();

            //Get the job ID
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();

            var loop = true;
            while (loop)
            {
                var jobInstances = unitOfWork.GetRepository<IntegrationJob>().GetTable()
                    .Where(ij => ij.JobDefinition.Name.Equals(jobDefinitionName)
                                 && ij.EndDateTime == null).ToList();

                if (jobInstances.Count > 0)
                {
                    Thread.Sleep(1000);
                    if (stopwatch.ElapsedMilliseconds > (long) (secondsToWait * 1000))
                    {
                        stopwatch.Stop();
                        throw new RealTimeCallTimeoutException(jobDefinitionName);
                    }
                }
                else
                {
                    loop = false;
                }
            }

            stopwatch.Stop();
        }
    }
}