// --------------------------------------------------------------------------------------------------------------------
// <copyright file="SwaggerConfig.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

using System.Configuration;
using System.Web;

using InsiteCommerce.Web;

[assembly: PreApplicationStartMethod(typeof(SwaggerConfig), "Register")]

namespace InsiteCommerce.Web
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
    using System.Web.Http;
    using System.Web.Http.Description;

    using Insite.Common.Extensions;
    using Insite.Swagger;

    using Swashbuckle.Application;
    using Swashbuckle.OData;

    /// <summary>The swagger config.</summary>
    public class SwaggerConfig
    {
        private static readonly Regex AdminApiRoute = new Regex(@"api\/.+\/admin\/.+", RegexOptions.Compiled);
        private static readonly Regex ODataKeyRoute = new Regex(@"api\/.+\/admin\/.+\(.*\)$", RegexOptions.Compiled);

        /// <summary>The register.</summary>
        public static void Register()
        {
            // Enable Swagger selectively because it does not work when the admin pages are enabled because of ODataMediaTypeFormatter errors
            // Based on Darwin Zins recommendation 5/31/2016
            var enable = ConfigurationManager.AppSettings["MSC_EnableSwagger"];
            if (enable != null && enable.EqualsIgnoreCase("true"))
            {
                var thisAssembly = typeof(ApiConfig).Assembly;

                GlobalConfiguration.Configuration.EnableSwagger(c =>
                {
                    c.CustomProvider(defaultProvider => new CachingSwaggerProvider(new ODataSwaggerProvider(defaultProvider, c)));

                    c.MultipleApiVersions((apiDesc, version) =>
                    {
                        var versionNumber = apiDesc.RelativePath.Split('/').Skip(1).FirstOrDefault() ?? "unknown";
                        return (AdminApiRoute.IsMatch(apiDesc.RelativePath)
                            ? $"admin-{versionNumber}"
                            : $"storefront-{versionNumber}").ContainsCaseInsensitive(version) || versionNumber.EqualsIgnoreCase("morsco");
                    },
                        vc =>
                        {
                            ApiConfig.Versions.Each(v => vc.Version(v.Key, v.Value));
                        });

                    c.GroupActionsBy(GroupBy);
                    c.UseFullTypeNameInSchemaIds();

                    var projects = GenerateProjectNames();
                    projects.Each(c.IncludeXmlComments);
                })
                    .EnableSwaggerUi(c =>
                    {
                        c.CustomAsset("index", thisAssembly, "Insite.Swagger.index.html");
                        c.EnableDiscoveryUrlSelector();
                        c.InjectStylesheet(thisAssembly, "Insite.Swagger.swagger-styles.css");
                        c.InjectJavaScript(thisAssembly, "Insite.Swagger.swagger-user.js");
                    });

                // TODO: Hookup authentication to allow sample request to work
                // TODO: Fix sorting issue with odata controllers. This may be fixed once we upgrade the Swashbuckle nuget package to 5.3.1. We cannot do this right now due to an issue with Swashbuckle.OData. See https://github.com/rbeauchamp/Swashbuckle.OData/commit/be2eeef4e660d3a73927ec6c8a3ac92fc6c7f32c
                // TODO: Use Swashbuckle.OData nuget package instead of custom dll in lib folder once https://github.com/rbeauchamp/Swashbuckle.OData/issues/71 is resolved
            }
        }

        private static string GroupBy(ApiDescription apiDescription)
        {
            if (AdminApiRoute.IsMatch(apiDescription.RelativePath))
            {
                var route = string.Join("/", apiDescription.RelativePath.Split('/').Take(4)).ToLower();

                if (route.Contains("?"))
                {
                    route = route.Remove(route.LastIndexOf("?", StringComparison.Ordinal));
                }

                if (ODataKeyRoute.IsMatch(route))
                {
                    route = route.Remove(route.LastIndexOf("(", StringComparison.Ordinal));
                }

                return route;
            }

            return string.Join("/", apiDescription.Route.RouteTemplate.Split('/').Take(3)).ToLower();
        }

        private static IEnumerable<string> GenerateProjectNames()
        {
            var xmlCommentsPath = $@"{AppDomain.CurrentDomain.BaseDirectory}\bin\xml\";
            var projects = new List<string>();

            if (!Directory.Exists(xmlCommentsPath))
            {
                return projects;
            }

            projects.AddRange(Directory.GetFiles(xmlCommentsPath, "*.xml"));
            return projects;
        }
    }
}