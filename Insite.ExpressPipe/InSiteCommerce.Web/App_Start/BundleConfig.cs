namespace InsiteCommerce.Web
{
    using System.Web.Optimization;
    using Insite.Common.Dependencies;
    using Insite.WebFramework.Theming;

    /// <summary>
    /// Sets up javascript and css bundling at application start.
    /// </summary>
    public class 
        BundleConfig
    {
        public const string LibraryScriptBundlePath = "~/bundles/js/libraries.min.js";

        /// <summary>Xml file containing all files to add to the libraries.min.js so they be edited easily for implementations</summary>
        public const string LibraryScriptXmlPath = "Scripts/Libraries/libraries.bundle.xml";

        public const string GlobalScriptBundlePath = "~/bundles/js/global.min.js";
        private static readonly string[] GlobalScripts = {
            "~/Scripts/App/insite.module.js",
            "~/Scripts/App/core/insite.authenticationinterceptor.factory.js",
            "~/Scripts/App/core/insite.core.httpErrorsInterceptor.factory.js",
            "~/Scripts/App/insite.config.js",
            "~/Scripts/App/insite.nav.js",
            "~/Scripts/App/insite.jquery.extensions.js",
            "~/Scripts/App/insite.core.js",
            "~/Scripts/App/insite.responsive.js",
            "~/Scripts/App/insite.personalization.js",
            "~/Scripts/App/insite.contentCore.js",
            "~/Scripts/App/insite.incontext.js",
            "~/Scripts/App/insite.predefinedContentEditor.js",
            "~/Scripts/App/insite.adminBridge.js",
            "~/Scripts/admin/Core/admin-session-service.js",
            "~/Scripts/admin/EntityLists/entity-list-state-service.js",
            "~/Scripts/App/insite.header.js",
        };

        public const string GlobalStyleBundlePath = "~/bundles/css/global.min.css";
        private static readonly string[] GlobalStyles = {
            "~/Styles/normalize.css",
            "~/Styles/foundation.css",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/themes/classic.css",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/themes/classic.date.css",
            "~/Scripts/Libraries/jquery-ui/1.9.2/jquery-ui.custom.css",
            "~/Styles/cms-shelltoggle.css"
        };

        // files with fonts that can't be bundled with foundation.css or there will be issues in IE
        public const string BaseStyleBundlePath = "~/bundles/css/base.min.css";
        private static readonly string[] BaseStyles = {
            "~/Styles/base.css",
            "~/Styles/cms-incontext.css"
        };

        public const string ProductListStyleBundlePath = "~/bundles/css/productlist.min.css";
        private static readonly string[] ProductListStyles = {
            "~/Styles/template/product-list.css",
            "~/Styles/template/product-category.css",
            "~/Styles/template/compare-hopper.css"
        };

        public const string ProductDetailStyleBundlePath = "~/bundles/css/productdetail.min.css";
        private static readonly string[] ProductDetailStyles = {
            "~/Styles/template/product-detail.css"
        };

        public const string ContentAdminLibraryScriptBundlePath = "~/bundles/js/contentadmin/libraries.min.js";
        private static readonly string[] ContentAdminLibraryScripts = {
            "~/Scripts/Libraries/jquery/1.10.2/jquery.min.js",
            "~/Scripts/Libraries/jquery-ui/1.9.2/jquery-ui.custom.min.js",
            "~/Scripts/Libraries/jquery-ui/jquery-ui-i18n.min.js",
            "~/Scripts/Libraries/jquery.validate/1.11.1/jquery.validate.min.js",
            "~/Scripts/Libraries/jquery.validate.unobtrusive.min.js",
            "~/Scripts/Libraries/foundation/5.4.6/foundation.min.js",
            "~/Scripts/Libraries/knockout/2.2.1/knockout.min.js",
            "~/Scripts/Libraries/knockout.mapping/2.2.4/knockout.mapping.js",
            "~/Scripts/Libraries/jquery.simplemodal/1.4.4/jquery.simplemodal.min.js",
            "~/Scripts/Libraries/jquery.cookie/1.3.1/jquery.cookie.js",
            "~/Scripts/Libraries/ckeditor/4.5.6/adapters/jquery.js",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/picker.js",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/picker.date.js",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/picker.time.js",
            "~/Scripts/Libraries/fancyselect/custom/fancySelect.js",
            "~/Scripts/Libraries/slick/slick.js",
            "~/Scripts/Libraries/sticky/sticky.js",
            "~/Scripts/Libraries/trimimage/trimimage.js",
            "~/Scripts/Libraries/equalHeights/equalHeights.js",
            "~/Scripts/Libraries/imagesLoaded/imagesLoaded.js",
            "~/Scripts/Libraries/angular/1.4.7/angular.min.js",
            "~/Scripts/Libraries/angular-cookie/4.1.0/angular-cookie.min.js",
            "~/Scripts/Libraries/angular-utf8-base64/angular-utf8-base64.js",
        };

        public const string ContentAdminGlobalScriptBundlePath = "~/bundles/js/contentadmin/global.min.js";
        private static readonly string[] ContentAdminGlobalScripts = {
            "~/Scripts/App/insite.jquery.extensions.js",
            "~/Scripts/App/insite.core.js",
            "~/Scripts/App/insite.contentCore.js",
            "~/Scripts/App/insite.contentadmin.js",
            "~/Scripts/App/insite.adminBridge.js",
            "~/Scripts/App/account/insite.session.service.js",
            "~/Scripts/admin/Core/admin-session-service.js",
            "~/Scripts/App/core/insite.sessionstorage.factory.js",
            "~/Scripts/admin/EntityLists/entity-list-state-service.js",
            "~/Scripts/App/core/insite.localstorage.factory.js",
            "~/Scripts/App/core/insite.core.service.js",
            "~/Scripts/App/insite.contentadmin.tree.js"
        };

        public const string ContentAdminGlobalStyleBundlePath = "~/bundles/css/contentadmin/global.min.css";
        private static readonly string[] ContentAdminGlobalStyles = {
            "~/Scripts/Libraries/jquery-ui/1.9.2/jquery-ui.custom.css",
            "~/Scripts/Libraries/jquery.fancytree/2.2.0/skin-lion/ui.fancytree.min.css",
            "~/Styles/normalize.min.css",
            "~/Styles/contentadmin.css",
            "~/Styles/cms.css",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/themes/classic.css",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/themes/classic.date.css",
            "~/Scripts/Libraries/pickadate/3.5.0-custom/themes/classic.time.css"
        };

        public const string FormBuilderGlobalStyleBundlePath = "~/bundles/css/formbuilder/global.min.css";
        private static readonly string[] FormBuilderGlobalStyles = {
            "~/Styles/normalize.min.css",
            "~/Styles/formbuilder.css",
        };

        public const string AdminGlobalScriptBundlePath = "~/bundles/js/admin/global.min.js";
        private static readonly string[] AdminGlobalScripts = {
            "~/Scripts/Libraries/jquery/2.1.4/jquery.min.js",
            "~/Scripts/Libraries/jquery-ui/1.9.2/jquery-ui.custom.min.js",
            "~/Scripts/Libraries/jquery.signalR/jquery.signalR-2.2.0.min.js",
            "~/Scripts/Libraries/angular/1.4.7/angular.js",
            "~/Scripts/Libraries/angular/1.4.7/angular-messages.min.js",
            "~/Scripts/Libraries/angular/1.4.7/angular-route.min.js",
            "~/Scripts/Libraries/angular-cookie/4.1.0/angular-cookie.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.core.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.angular.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.data.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.popup.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.list.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.calendar.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.fx.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.userevents.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.draganddrop.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.combobox.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.datepicker.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.timepicker.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.datetimepicker.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.notification.min.js",
            "~/Scripts/Libraries/kendo-ui/v3.1111/js/kendo.treeview.min.js",
            "~/Scripts/Libraries/foundation-apps/1.2.0/dist/js/foundation-apps.min.js",
            "~/Scripts/Libraries/foundation-apps/1.2.0/dist/js/foundation-apps-templates.min.js",
            "~/Scripts/Libraries/smart-table/2.1.4/smart-table.js",
            "~/Scripts/Libraries/jquery.simplemodal/1.4.4/jquery.simplemodal.min.js",
            "~/Scripts/Libraries/angular-ui-select/0.13.2/select.min.js",
            "~/Scripts/Libraries/angular-ui-sortable/0.13.4/sortable.min.js",
            "~/Scripts/Libraries/angular-elastic/2.5.1-custom/elastic.min.js",
            "~/Scripts/Libraries/angular-utf8-base64/angular-utf8-base64.js",
            "~/Scripts/Libraries/ckfinder/2.4.1/ckfinder.js",
            "~/Scripts/Libraries/jquery.fancytree/2.2.0/jquery.fancytree.min.js",
            "~/Scripts/app/insite.jquery.extensions.js",
            "~/Scripts/Libraries/moment/2.10.6/moment.min.js",
            "~/Scripts/admin/Core/module.js",
            "~/Scripts/App/core/insite.core.httpErrorsInterceptor.factory.js",
            "~/Scripts/App/core/insite.sessionstorage.factory.js",
            "~/Scripts/App/core/insite.localstorage.factory.js",
            "~/Scripts/App/core/insite.core.service.js",
            "~/Scripts/App/account/insite.session.service.js",
            "~/Scripts/admin/EntityLists/entity-list-controller.js", // base entity list controller
            "~/Scripts/admin/EntityLists/entities-controller.js", // base for some other controllers
            "~/Scripts/admin/EntityForms/entity-details-controller.js", // base edit entity controller
            "~/Scripts/admin/shared/change-user-credentials-controller.js",
            "~/Scripts/admin/*"
        };

        public const string AdminGlobalStyleBundlePath = "~/bundles/css/admin/global.min.css";
        private static readonly string[] AdminGlobalStyles = {
            "~/Styles/admin/foundation-apps.css",
            "~/Scripts/Libraries/kendo-ui/v3.1111/styles/kendo.common.min.css",
            "~/Scripts/Libraries/kendo-ui/v3.1111/styles/kendo.metro.min.css",
            "~/Scripts/Libraries/angular-ui-select/0.13.2/select.min.css",
            "~/Scripts/Libraries/angular-ui-select/0.13.2/select2.min.css",
            "~/Scripts/Libraries/angular-ui-select/0.13.2/selectize.min.css",
            "~/Scripts/Libraries/jquery.fancytree/2.2.0/ui.fancytree.min.css",
            "~/Scripts/Libraries/tether-drop/1.2.2/dist/css/drop-theme-twipsy.min.css",
            "~/Styles/admin/admin.css"
        };

        public static void RegisterBundles(BundleCollection bundles)
        {
            var fileBundler = DependencyLocator.Current.GetInstance<IFileBundler>();
            fileBundler.AddScriptBundleFromXml(bundles, LibraryScriptBundlePath, LibraryScriptXmlPath);
            fileBundler.AddAutomaticGlobalScriptBundle(bundles, GlobalScriptBundlePath, GlobalScripts);
            fileBundler.AddThemedStyleBundles(bundles, GlobalStyleBundlePath, GlobalStyles);
            fileBundler.AddThemedStyleBundles(bundles, BaseStyleBundlePath, BaseStyles);            
            fileBundler.AddThemedStyleBundles(bundles, ProductListStyleBundlePath, ProductListStyles);            
            fileBundler.AddThemedStyleBundles(bundles, ProductDetailStyleBundlePath, ProductDetailStyles);
            fileBundler.AddScriptBundle(bundles, ContentAdminLibraryScriptBundlePath, ContentAdminLibraryScripts);
            fileBundler.AddScriptBundle(bundles, ContentAdminGlobalScriptBundlePath, ContentAdminGlobalScripts);
            fileBundler.AddScriptBundle(bundles, AdminGlobalScriptBundlePath, AdminGlobalScripts);
            fileBundler.AddStyleBundle(bundles, ContentAdminGlobalStyleBundlePath, ContentAdminGlobalStyles);
            fileBundler.AddStyleBundle(bundles, FormBuilderGlobalStyleBundlePath, FormBuilderGlobalStyles);
            fileBundler.AddStyleBundle(bundles, AdminGlobalStyleBundlePath, AdminGlobalStyles);
        }       
    }
}