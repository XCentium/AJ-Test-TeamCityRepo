namespace InsiteCommerce.Web.Areas.Admin
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Mvc;
    using System.Web.Routing;

    using Insite.Admin.Controllers;

    public class AdminAreaRegistration : AreaRegistration
    {
        public override string AreaName => "Admin"; 

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute("admin", "Admin", new { action = "Index", controller = "Home" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Console", new { action = "RedirectToAdmin", controller = "Home" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/Directives/{name}", new { controller = "Directives", action = "Index" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/Data/Categories", new { controller = "Data", action = "Categories" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Data/SelectCategory", new { controller = "Data", action = "SelectCategory" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Data/new", new { controller = "Data", action = "New" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Data/{formName}/{id}", new { controller = "Data", action = "Entity" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Data/{formName}", new { controller = "Data", action = "Entities" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/Import/{pluralizedName}/PreValidate", new { controller = "Import", action = "PreValidate" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Import/{pluralizedName}/Details/{jobId}", new { controller = "Import", action = "Details" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Import/GetJobInfo/{jobId}", new { controller = "Import", action = "GetJobInfo" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Import/GetFile", new { controller = "Import", action = "GetFile" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Import/Cancel/{jobId}", new { controller = "Import", action = "Cancel" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Import/{pluralizedName}/{action}", new { controller = "Import", action = "Index" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/Export/{pluralizedName}/Details/{jobId}", new { controller = "Export", action = "Details" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Export/GetJobInfo/{jobId}", new { controller = "Export", action = "GetJobInfo" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Export/GetFile", new { controller = "Export", action = "GetFile" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Export/Cancel/{jobId}", new { controller = "Export", action = "Cancel" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Export/{pluralizedName}/{action}", new { controller = "Export", action = "Index" }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/JobList", new { controller = "Job", action = "Index" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/JobDefinition/JobDefinition.json", new { controller = "JobDefinition", action = "Export" }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/NotFound/{*path}", new { controller = "Error", action = "NotFound", path = UrlParameter.Optional }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/Error/{*errorCode}", new { controller = "Error", action = "Index", path = UrlParameter.Optional }, new[] { "Insite.Admin.Controllers" });
            
            context.MapRoute(null, "Admin/{action}/{id}", new { controller = "Home", action = "Index", id = UrlParameter.Optional }, new { isMethodInHomeController = new RootRouteConstraint<HomeController>() }, new[] { "Insite.Admin.Controllers" });
            context.MapRoute(null, "Admin/{controller}/{action}/{id}", new { action = "Index", id = UrlParameter.Optional }, new[] { "Insite.Admin.Controllers" });

            context.MapRoute(null, "Admin/{*url}", new { controller = "Home", action = "Index" });
        }
    }

    public class RootRouteConstraint<T> : IRouteConstraint
    {
        private readonly IEnumerable<string> rootMethodNames;

        public RootRouteConstraint()
        {
            this.rootMethodNames = typeof(T).GetMethods().Select(o => o.Name.ToLower()).ToList();
        } 

        public bool Match(HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
        {
            return this.rootMethodNames.Contains(values["action"].ToString().ToLower());
        }
    }
}
