// --------------------------------------------------------------------------------------------------------------------
// <copyright file="SignalRConfig.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

namespace InsiteCommerce.Web
{
    using Insite.Core.Interfaces.Providers;

    using Microsoft.AspNet.SignalR;
    using Microsoft.AspNet.SignalR.Hubs;

    using Owin;

    /// <summary>The startup.</summary>
    public partial class Startup
    {
        /// <summary>The configure signal r.</summary>
        /// <param name="app">The app.</param>
        public void ConfigureSignalR(IAppBuilder app)
        {
            GlobalHost.DependencyResolver.Register(typeof(IHubActivator), () => new UnityHubActivator());
            GlobalHost.DependencyResolver.UseSqlServer(ConnectionStringProvider.Current.ConnectionString);

            app.MapSignalR();
        }
    }
}