using Insite.Catalog.Services;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.Utils;
using System;
using System.IO;
using Insite.Common.Logging;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Repositories.Interfaces;
using Morsco.PonderosaService.Common;
using Morsco.PonderosaService.Services;

namespace Morsco.Customizations.Lib.Repositories
{
    public class PonderosaOrderUpdateRepository : BaseRepository, IPonderosaOrderUpdateRepository, IInterceptable
    {
        private string _ssisPath;
        private string _tempFolder;
        private string _headerFile;
        private string _detailFile;

        public PonderosaOrderUpdateRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService)
            : base(unitOfWorkFactory, customerService, productService){ }
        public bool GetOrderChanges()
        {
            string timeStamp = $"{DateTime.Now:yyyyMMdd-hhmmss}";

            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            string mscOrderUpdateChangedOrderMode = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_OrderUpdate_ChangedOrderMode");

            _ssisPath = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_OrderUpdate_SSISPath");
            _tempFolder = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_OrderUpdate_TempFolder");
            _headerFile = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_OrderUpdate_HeaderFile");
            _detailFile = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("MSC_OrderUpdate_DetailFile");

            _headerFile = _tempFolder + string.Concat(Path.GetFileNameWithoutExtension(_headerFile), timeStamp, Path.GetExtension(_headerFile));
            _detailFile = _tempFolder + string.Concat(Path.GetFileNameWithoutExtension(_detailFile), timeStamp, Path.GetExtension(_detailFile));

            try
            {
                using (var svc = new OrderServices())
                using (var handler = new OrderRefreshResultHandler(_headerFile, _detailFile))
                {
                    var onlyChangedOrders = mscOrderUpdateChangedOrderMode == "Changed";
                    svc.GetChangedOrders(onlyChangedOrders, false, null, null, 0, 1000, handler);
                }
                PonderosaOrderChangeUtility.CopyFileSSISPath(_tempFolder, _ssisPath);
            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error("Get Order Change execution failed: " + ex.Message);
                throw;
            }
            return true;
        }
     
    }
}