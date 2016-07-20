// --------------------------------------------------------------------------------------------------------------------
// <copyright file="WebApiConfig.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

using WebGrease.Css.Extensions;

namespace InsiteCommerce.Web
{
    using System;
    using System.Configuration;
    using System.Linq;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Web.Http;
    using System.Web.Http.Cors;
    using System.Web.Http.Dispatcher;
    using System.Web.Http.ExceptionHandling;
    using System.Web.Http.Validation;
    using System.Web.OData;
    using System.Web.OData.Extensions;
    using System.Web.OData.Formatter;
    using System.Web.OData.Formatter.Deserialization;

    using CacheCow.Server;
    using CacheCow.Server.EntityTagStore.SqlServer;

    using Insite.Admin.Controllers;
    using Insite.Admin.ODataExtensions;
    using Insite.Admin.Providers;
    using Insite.Core.BootStrapper;
    using Insite.Core.Interfaces.Data;
    using Insite.Core.WebApi;
    using Insite.Data.Repositories.Interfaces;
    using Insite.WebFramework.ContractResolvers;

    using Microsoft.Owin.Security.OAuth;
    using Microsoft.Practices.Unity;

    using Newtonsoft.Json;

    using Unity.WebApi;

    /// <summary>
    /// WebApi Configuration class.
    /// </summary>
    public static class WebApiConfig
    {
        /// <summary>The web api server cache timeout.</summary>
        private static int etagCacheServerDuration = 5;

        /// <summary>The web api client cache timeout.</summary>
        private static int etagCacheClientDuration = 5;

        /// <summary>Registers the specified configuration.</summary>
        /// <param name="config">The configuration.</param>
        /// <param name="unityContainer">The unity container.</param>
        /// <param name="unitOfWork">The unit of work.</param>
        public static void Register(HttpConfiguration config, IUnityContainer unityContainer, IUnitOfWork unitOfWork)
        {
            var applicationSettingRepository = unitOfWork.GetTypedRepository<IApplicationSettingRepository>();

            etagCacheServerDuration = applicationSettingRepository.GetOrCreateByName<int>("EtagCacheServerDuration");
            etagCacheClientDuration = applicationSettingRepository.GetOrCreateByName<int>("EtagCacheClientDuration");

#if !DEBUG

    // Configure Web API to use only bearer token authentication.
    // Only suppress if not in debug mode, this allows browsing the WebAPI if in debug mode.
            config.SuppressDefaultHostAuthentication();
#endif

            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));
            config.Filters.Add(new ModelStateValidationFilter());
            
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new DeltaContractResolver();

            config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(new SelectSupportConverter());

            var browserFormatter = new BrowserJsonFormatter
            {
                SerializerSettings =
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore, 
                    ContractResolver = new DeltaContractResolver()
                }
            };

            browserFormatter.SerializerSettings.Converters.Add(new SelectSupportConverter());

            config.Formatters.Add(browserFormatter);

            // Allow odata queries to be case insensitive. We want this behavior because on the client side all properties are
            // converted to camelcase and this will provide a more consistent experience.
            config.EnableCaseInsensitive(true);

            config.DependencyResolver = new UnityDependencyResolver(unityContainer);

            // Changing this setting requires a website restart
            if (applicationSettingRepository.GetOrCreateByName<bool>("Caching_EnableEtags"))
            {
                var etagStore = new SqlServerEntityTagStore(ConfigurationManager.ConnectionStrings["InSite.Commerce"].ConnectionString);

                // The vary by in the constructor needs to be something that is unique per user so it generates ETags uniquely per user
                // Cookie contains a cookie we generate InsiteCacheId that is a guid per user.
                var cacheHandler = new CachingHandler(config, etagStore, "Cookie")
                {
                    // This must be false so IE client side caching works, anything that needs to vary needs to be done by uri or querystring
                    AddVaryHeader = false, 
                    AddLastModifiedHeader = true,
                    RoutePatternProvider = new CacheRoutePatternProvider(),
                    CacheControlHeaderProvider = CacheControlHeaderProvider,
                    CacheRefreshPolicyProvider = CacheRefreshPolicyProvider
                };
                config.MessageHandlers.Add(cacheHandler);
            }

            config.MessageHandlers.Add(new LocalizationHandler());
            config.MapHttpAttributeRoutes(new InheritanceDirectRouteProvider());

            config.EnableUnqualifiedNameCall(true);
            config.MapODataServiceRoute("AdminOData", "api/v1/admin", ODataEdmModelProvider.GetEdmModel(),
                HttpClientFactory.CreatePipeline(new HttpControllerDispatcher(config), new[] { new ODataNullValueMessageHandler() }));

            //Customization:  Add to end of range, unless the MSC_EnableAdmin flag is set -- then you'll get ODataMediaTypeFormatter errors.
            var enableAdmin = ConfigurationManager.AppSettings["MSC_EnableAdmin"];
            if (enableAdmin.EqualsIgnoreCase("true"))
            {
                config.Formatters.InsertRange(0, ODataMediaTypeFormatters.Create(new CustomODataSerializerProvider(), new DefaultODataDeserializerProvider()));
            }
            else
            {
                config.Formatters.AddRange(ODataMediaTypeFormatters.Create(new CustomODataSerializerProvider(), new DefaultODataDeserializerProvider()));
            }

            // Changing this setting requires a website restart
            var corsOrigin = BootStrapper.GetApplicationSetting("Cors_Origin", string.Empty);
            if (!corsOrigin.IsBlank())
            {
                config.EnableCors(new EnableCorsAttribute(corsOrigin, "*", "*") { SupportsCredentials = true });
            }

            // There can be multiple exception loggers. (By default, no exception loggers are registered.)
            config.Services.Add(typeof(IExceptionLogger), unityContainer.Resolve<IExceptionLogger>());
            config.Services.Add(typeof(ModelValidatorProvider), new EntityDefinitionModelValidatorProvider());
            
            // There must be exactly one exception handler. (There is a default one that may be replaced.)
            config.Services.Replace(typeof(IExceptionHandler), unityContainer.Resolve<IExceptionHandler>());
        }

        /// <summary>The cache control header provider.</summary>
        /// <param name="request">The request.</param>
        /// <param name="httpConfiguration">The http configuration.</param>
        /// <returns>The <see cref="CacheControlHeaderValue"/>.</returns>
        private static CacheControlHeaderValue CacheControlHeaderProvider(HttpRequestMessage request, HttpConfiguration httpConfiguration)
        {
            var cacheServerSide = CacheResourceServerSide(request.RequestUri);
            var cacheClientSide = CacheResourceClientSide(request.RequestUri);

            if (!cacheServerSide && !cacheClientSide)
            {
                return null;
            }

            return new CacheControlHeaderValue
            {
                Private = true, 

                // This has to be false for IE to cache the resource client side, other browsers don't seem to care
                MustRevalidate = !cacheClientSide, 
                NoTransform = true,
                MaxAge = cacheClientSide
                    ? TimeSpan.FromMinutes(etagCacheClientDuration)
                    : TimeSpan.Zero
            };
        }

        /// <summary>The cache refresh policy provider.</summary>
        /// <param name="request">The request.</param>
        /// <param name="httpConfiguration">The http configuration.</param>
        /// <returns>The <see cref="TimeSpan"/>.</returns>
        private static TimeSpan CacheRefreshPolicyProvider(HttpRequestMessage request, HttpConfiguration httpConfiguration)
        {
            // Expire server side cache right away for things that are cached for a duration of time client side.
            // This forces the next request after the client side timeout to re-get and re-cache the resource client side with a new max-age
            // so that it stays cached client side, otherwise it doesn't re-set the modified since and max age.
            if (CacheResourceClientSide(request.RequestUri))
            {
                var cacheHandler = httpConfiguration.MessageHandlers.OfType<ICachingHandler>().FirstOrDefault();
                cacheHandler?.InvalidateResource(request);

                return TimeSpan.FromMinutes(etagCacheClientDuration);
            }

            return TimeSpan.FromMinutes(etagCacheServerDuration);
        }

        /// <summary>Returns true if the supplied resource can be cached server side (using ETags).</summary>
        /// <param name="resourceUri">The resource uri.</param>
        /// <returns>True if the resource can be cached server side.</returns>
        private static bool CacheResourceServerSide(Uri resourceUri)
        {
            if (resourceUri == null || resourceUri.Segments.Length < 4)
            {
                return false;
            }

            var resource = resourceUri.Segments[3].TrimEnd('/');
            return !resource.EqualsIgnoreCase("budgetcalendars")
                && !resource.EqualsIgnoreCase("budgets")
                && !resource.EqualsIgnoreCase("dashboardpanels")
                && !resource.EqualsIgnoreCase("messages")
                && !resource.EqualsIgnoreCase("orderapprovals")
                && !resource.EqualsIgnoreCase("quotes")
                && !resource.EqualsIgnoreCase("requisitions")
                && !resource.EqualsIgnoreCase("autocomplete")
                && !resource.EqualsIgnoreCase("admin");
        }

        /// <summary>Returns true if the supplied resource can be cached client side (in the browser cache).</summary>
        /// <param name="resourceUri">The resource uri.</param>
        /// <returns>True if the resource can be cached client side.</returns>
        private static bool CacheResourceClientSide(Uri resourceUri)
        {
            if (resourceUri == null || resourceUri.Segments.Length < 4)
            {
                return false;
            }

            var resource = resourceUri.Segments[3].TrimEnd('/');

            // Do not cache website crosssells client side
            if (resource.EqualsIgnoreCase("websites")
                && resourceUri.Segments.Length >= 6
                && resourceUri.Segments[5].TrimEnd('/').EqualsIgnoreCase("crosssells"))
            {
                return false;
            }

            return resource.EqualsIgnoreCase("settings")
                || resource.EqualsIgnoreCase("websites");
        }
    }
}