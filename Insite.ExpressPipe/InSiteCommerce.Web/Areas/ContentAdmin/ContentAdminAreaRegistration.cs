using System.Web.Mvc;

namespace InsiteCommerce.Web.Areas.ContentAdmin
{
    public class ContentAdminAreaRegistration : AreaRegistration
    {
        public override string AreaName
        {
            get
            {
                return "ContentAdmin";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context)
        {
            context.MapRoute(
                "ContentAdmin_default_microsite",
                "{microSite}/ContentAdmin/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional },
                new[] { "Insite.ContentAdmin.Controllers" }
            );
            context.MapRoute(
                "ContentAdmin_default",
                "ContentAdmin/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional },
                new[] { "Insite.ContentAdmin.Controllers" }
            );

            context.MapRoute(
                "ContentAdmin_home_microsite",
                "{microSite}/ContentAdmin",
                new { action = "Index", controller = "Shell" },
                new[] { "Insite.ContentAdmin.Controllers" }
            );
            context.MapRoute(
                "ContentAdmin_home", 
                "ContentAdmin", 
                new { action = "Index", controller = "Shell" },
                new[] { "Insite.ContentAdmin.Controllers" }
            );
        }
    }
}
