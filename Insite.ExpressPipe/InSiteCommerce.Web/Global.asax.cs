using System.Web.Script.Serialization;
using Morsco.PonderosaService.Services;

namespace InsiteCommerce.Web
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Configuration;
    using System.Web.Http;
    using System.Web.Mvc;
    using System.Web.Optimization;
    using System.Web.Routing;
    using Insite.Account.Content;
    using Insite.Common.Dependencies;
    using Insite.Common.Logging;
    using Insite.Core.Interfaces.Data;
    using Insite.Data.Repositories.Interfaces;
    using Insite.Integration.WebService;
    using Insite.Integration.WebService.Interfaces;
    using Insite.IocContainer.Unity;
    using Insite.WebFramework.Routing;
    using Insite.WIS.Broker;
    using Insite.WIS.Broker.Interfaces;
    using Insite.WIS.Broker.WebIntegrationService;

    public class MvcApplication : Insite.WebFramework.Mvc.MvcApplication
    {
        protected override void RegisterCustomRoutes(RouteCollection routes, IRouteProvider routeProvider)
        {
            // Add additional routes with this syntax
            // routeProvider.MapRoute(routes, null, "Test", new { Controller = "Test", Action = "Index" }, true);
            routes.MapRoute("OrderHistory", "OrderHistory/{action}/{ErpOrderNumber}",  new { controller = "OrderHistory", action = "Index", ErpOrderNumber = "" });
            routes.MapRoute("ProductView", "ProductView/{action}", new { controller = "ProductView", action = "Index" });
        }

        protected override void PreCustomApplicationStart()
        {
            // happens before any of the base application start logic
        }

        /// <summary>
        /// Custom application start.
        /// </summary>
        /// <param name="iocContainer">The ioc container.</param>
        /// <param name="unitOfWork">The unit of work.</param>
        protected override void CustomApplicationStart(UnityIocContainer iocContainer, IUnitOfWork unitOfWork)
        {
            GlobalConfiguration.Configure(c => WebApiConfig.Register(c, iocContainer.UnityContainer, unitOfWork));

            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Start web server Side Integration Processing, must be started in a separate thread because it calls back to webservices in the site
            var startupFolder = this.Server.MapPath(@"/");
            Task.Factory.StartNew(() => this.IntegrationStart(startupFolder));

            //Initialize Ponderosa
            InitializePonderosa();
        }

        // TODO 4.2 this should be moved if possible. 
        /// <summary>
        /// If there is a SiteConnections.config file in the website root folder, start a server side <see cref="IWindowsIntegrationBroker"/>.
        /// If there is not a SiteConnections.config file in the website root folder, register all the <see cref="IIntegrationProcessor"/>s so
        /// that pass through jobs can still run.
        /// </summary>
        protected void IntegrationStart(string startupFolder)
        {
            var unitOfWork = DependencyLocator.Current.GetInstance<IUnitOfWorkFactory>().GetUnitOfWork();
            var localSiteConnectionFile = Path.Combine(startupFolder, "SiteConnections.config");
            var windowsIntegrationBroker = DependencyLocator.Current.GetInstance<IWindowsIntegrationBroker>();
            var siteConnections = new List<SiteConnection>();

            if (this.ShouldStartInternalIntegrationService(unitOfWork))
            {
                siteConnections.Add(this.CreateInternalSiteConnection());
                LogHelper.For(this).Debug("The web server " + Environment.MachineName.ToLower() + " started an instance of the Internal Windows Integration Service (WIS).");
            }
            else
            {
                LogHelper.For(this).Debug("The web server " + Environment.MachineName.ToLower() + " did not start an instance of the Internal Windows Integration Service (WIS).  Please check the setting for 'ERP_IntegrationServiceAllowedMachines'");
            }

            if (File.Exists(localSiteConnectionFile))
            {
                siteConnections.AddRange(windowsIntegrationBroker.LoadSiteConnections(localSiteConnectionFile));
        }

            windowsIntegrationBroker.IntegrationStart(startupFolder, siteConnections);
            this.RegisterWindowIntegrationServicePlugins(unitOfWork, startupFolder, windowsIntegrationBroker);

            unitOfWork.Close();
        }

        protected virtual bool ShouldStartInternalIntegrationService(IUnitOfWork unitOfWork)
        {
            #if DEBUG
                return true;
            #endif

#pragma warning disable 162
            //Disable unreachable code.  Doesn't take into account #if DEBUG
            var allowedMachines = new List<string>();
            var commaDelimitedMachineNames = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("ERP_IntegrationServiceAllowedMachines").ToLower().Trim();
            allowedMachines.AddRange(commaDelimitedMachineNames.Split(',').Select(s => s.Trim()));

            return allowedMachines.Contains(Environment.MachineName.ToLower());
#pragma warning restore 162
            
        }

        protected virtual SiteConnectionInternal CreateInternalSiteConnection()
        {
            var webServiceHandler = DependencyLocator.Current.GetInstance<IWebServiceHandler>();
            return new SiteConnectionInternal(webServiceHandler) 
            {
                IntegrationConnectionName = "Internal",
                EnableRealTimeThread = false,
                BatchTimerInterval = 2000,
                RealTimeTimerInterval = 500,
                DllFolder = "Internal",
                MaxBlockSize = 5242880,
                IsActive = true
            };
        }

        private void RegisterWindowIntegrationServicePlugins(IUnitOfWork unitOfWork, string startupFolder, IWindowsIntegrationBroker windowsIntegrationBroker)
        {
            var siteConnections = unitOfWork
                .GetRepository<Insite.Data.Entities.IntegrationConnection>().GetTable()
                .Select(c => new SiteConnection { IntegrationConnectionName = c.Name, DllFolder = c.Name, IsActive = true }).ToList();

            if (siteConnections.Any())
            {
                var webServiceHandler = DependencyLocator.Current.GetInstance<IWebServiceHandler>();

                var windowsIntegrationServiceDtos = windowsIntegrationBroker.IntegrationStart(startupFolder, siteConnections, false);

                foreach (var siteConnection in siteConnections)
                {
                    var windowsIntegrationServiceDto = windowsIntegrationServiceDtos.FirstOrDefault(w => w.ConnectionName.EqualsIgnoreCase(siteConnection.IntegrationConnectionName));
                    var webSideDto = Insite.Integration.Utilities.JsonTypeConverter.ConvertType<WindowsIntegrationServiceDto, Insite.Integration.WebService.Dtos.WindowsIntegrationServiceDto>(windowsIntegrationServiceDto);
                    webServiceHandler.RegisterPlugins(webSideDto, false);
                }
            }
        }

        protected override void Application_End(object sender, EventArgs e)
        {
            base.Application_End(sender, e);

            var windowsIntegrationBroker = DependencyLocator.Current.GetInstance<IWindowsIntegrationBroker>();
            windowsIntegrationBroker.IntegrationStop();
        }

        private void InitializePonderosa()
        {
            if (!Boolean.Parse(WebConfigurationManager.AppSettings["Morsco.Ponderosa.Disabled"]))
            {
                var ponderosaConfigSectionName = PonderosaService.GetConfigSectionName();
                try
                {
                    PonderosaService.InitializeConnectionPool();
                    LogHelper.For(this).Info("Initialized Ponderosa Service with configuration section=" + ponderosaConfigSectionName);
                }
                catch (Exception e)
                {
                    LogHelper.For(this).Error("Failed to initialize Ponderosa with configurationSection " + ponderosaConfigSectionName, e);
                }
            }
        }

        protected override void RewriteResponse()
        {
            base.RewriteResponse();

            var context = new HttpContextWrapper(this.Context);
            // If we're an ajax request, and doing a 302 to the /MyAccount/Login action, then we actually need to do a 401 so that our js can redirect to the login properly
            if (this.Context.Response.StatusCode == 302 && context.Request.IsAjaxRequest() && !context.Request.Path.ToLower().StartsWith("/admin"))
            {
                var urlProvider = DependencyLocator.Current.GetInstance<IUrlProvider>();
                if (context.Response.RedirectLocation.ToLower().Contains("/redirectto/signinpage") || context.Response.RedirectLocation.ToLower().Contains(urlProvider.GetUrl<SignInPage>().ToLower()))
                {
                    this.Context.Response.Clear();
                    this.Context.Response.StatusCode = 401;
                }
            }
        }
    }
}