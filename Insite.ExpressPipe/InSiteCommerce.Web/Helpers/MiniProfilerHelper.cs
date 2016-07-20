namespace InsiteCommerce.Web.Helpers
{
    using System;
    using System.Linq;
    using Insite.Common.Dependencies;
    using Insite.Core.Interfaces.Data;
    using Insite.Core.Interfaces.Plugins.Caching;
    using Insite.Data.Repositories.Interfaces;

    using StackExchange.Profiling;

    public class MiniProfilerHelper
    {
        public static void StartIfConfigured()
        {
            if (UseMiniProfiler())
            {
                var ignoredPaths = MiniProfiler.Settings.IgnoredPaths.ToList();
                ignoredPaths.Add("/Images/");
                ignoredPaths.Add("/UserFiles/");
                ignoredPaths.Add("/Styles/");
                MiniProfiler.Settings.IgnoredPaths = ignoredPaths.ToArray();

                MiniProfiler.Start();
            }
        }

        public static void StopIfConfigured()
        {
            if (UseMiniProfiler())
            {
                MiniProfiler.Stop();
            }
        }

        private static bool UseMiniProfiler()
        {
            var cacheManager = DependencyLocator.Current.GetInstance<ICacheManager>();
            return cacheManager.Get("UseMiniProfiler", () =>
                {
                    var unitOfWork = DependencyLocator.Current.GetInstance<IUnitOfWorkFactory>().GetUnitOfWork();

                    return unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<bool>("MiniProfiler_Enabled");
                }, TimeSpan.FromMinutes(5));
        }
    }
}