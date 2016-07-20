// --------------------------------------------------------------------------------------------------------------------
// <copyright file="UnityHubActivator.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

namespace InsiteCommerce.Web
{
    using System;

    using Insite.Common.Dependencies;

    using Microsoft.AspNet.SignalR.Hubs;

    /// <summary>The unity hub activator.</summary>
    public class UnityHubActivator : IHubActivator
    {
                /// <summary>The create.</summary>
        /// <param name="descriptor">The descriptor.</param>
        /// <returns>The <see cref="IHub"/>.</returns>
        /// <exception cref="ArgumentNullException"></exception>
        public IHub Create(HubDescriptor descriptor)
        {
            if (descriptor == null)
            {
                throw new ArgumentNullException(nameof(descriptor));
            }

            if (descriptor.HubType == null)
            {
                return null;
            }

            var hub = DependencyLocator.Current.GetInstance(descriptor.HubType) ?? Activator.CreateInstance(descriptor.HubType);
            return hub as IHub;
        }
    }
}