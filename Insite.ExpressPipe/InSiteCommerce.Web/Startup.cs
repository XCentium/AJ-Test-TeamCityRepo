// --------------------------------------------------------------------------------------------------------------------
// <copyright file="Startup.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------



using InsiteCommerce.Web;

using Microsoft.Owin;

[assembly: OwinStartup(typeof(Startup))]

namespace InsiteCommerce.Web
{
    using Owin;

    /// <summary>
    /// OWIN Startup class.
    /// </summary>
    public partial class Startup
    {
        /// <summary>Called on OWIN startup to configure the app.</summary>
        /// <param name="app">The application.</param>
        public void Configuration(IAppBuilder app)
        {
            this.ConfigureAuth(app);
        }
    }
}