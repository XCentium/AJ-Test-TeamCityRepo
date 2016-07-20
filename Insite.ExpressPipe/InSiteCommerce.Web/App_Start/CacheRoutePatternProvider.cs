// --------------------------------------------------------------------------------------------------------------------
// <copyright file="CacheRoutePatternProvider.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

namespace InsiteCommerce.Web
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net.Http;
    using System.Web;

    using CacheCow.Server.RoutePatternPolicy;

    using Insite.Core.WebApi;
    using Insite.Core.WebApi.Extensions;

    /// <summary>
    /// Responsible for providing route pattern and linked route patterns.
    /// </summary>
    public class CacheRoutePatternProvider : IRoutePatternProvider
    {
        /// <summary>Generates the route pattern stored for this request to be used to invalidate the resource.</summary>
        /// <param name="request">The request.</param>
        /// <returns>The <see cref="string"/>.</returns>
        public string GetRoutePattern(HttpRequestMessage request)
        {
            return GetPattern(request);
        }

        /// <summary>Gets all linked route patterns for this request. Called at the time of invalidation.</summary>
        /// <param name="request">The request.</param>
        /// <returns>All linked route patterns for this request that should be invalidated.</returns>
        public IEnumerable<string> GetLinkedRoutePatterns(HttpRequestMessage request)
        {
            // GET requests never need to invalidate the cache
            if (request.Method == HttpMethod.Get)
            {
                return new List<string> { string.Empty };
            }

            var pattern = GetPattern(request);

            // post to quotes should invalidate the cart
            if (request.Method == HttpMethod.Post && pattern.StartsWith("quotes", StringComparison.OrdinalIgnoreCase))
            {
                var cacheId = request.GetCookie(Constants.CacheCookieName);
                return new List<string> { "carts" + cacheId };
            }

            // all changes to session should invalidate related resources
            if (pattern.StartsWith("sessions", StringComparison.OrdinalIgnoreCase))
            {
                return GetInvalidateRoutes(request);
            }

            // adding a new account should invalidate related resources
            if (pattern.StartsWith("accounts", StringComparison.OrdinalIgnoreCase)
                && request.Method == HttpMethod.Post)
            {
                return GetInvalidateRoutes(request);
            }

            return new List<string> { pattern };
        }

        /// <summary>The get invalidate routes.</summary>
        /// <param name="request">The request.</param>
        /// <returns>The <see cref="List"/>.</returns>
        private static List<string> GetInvalidateRoutes(HttpRequestMessage request)
        {
            var cacheId = request.GetCookie(Constants.CacheCookieName);
            return new List<string>
            {
                "accounts" + cacheId, 
                "autocomplete" + cacheId, 
                "billtos" + cacheId, 
                "carts" + cacheId, 
                "catalogpages" + cacheId, 
                "categories" + cacheId, 
                "products" + cacheId, 
                "sessions" + cacheId, 
                "websites/current/crosssells" + cacheId
            };
        }

        /// <summary>The get pattern.</summary>
        /// <param name="request">The request.</param>
        /// <returns>The <see cref="string"/>.</returns>
        private static string GetPattern(HttpRequestMessage request)
        {
            if (request == null)
            {
                throw new HttpException(404, "Invalid Route");
            }

            var resourceUri = request.RequestUri;
            if (resourceUri.Segments.Count() < 4)
            {
                return string.Empty;
            }

            // Segments[3] is the main resource, for example /api/v1/carts, Segments[3] returns carts
            var resource = resourceUri.Segments[3].TrimEnd('/');

            if (resource.EqualsIgnoreCase("admin") && resourceUri.Segments.Length >= 5)
            {
                // ETag caching is disabled for admin, but leaving this here if we decide to re-enable it
                // For admin api Segments[4] is the main resource, for example /api/v1/admin/products, Segments[4] returns products
                resource = resourceUri.Segments[4].TrimEnd('/');
                if (resource.Contains("("))
                {
                    // strip the "(id)" off the resource uri if there is one, odata requests use this convention instead of /id
                    resource = resource.Substring(0, resource.IndexOf("("));
                }
            } 
            else if (resource.EqualsIgnoreCase("websites")
                && resourceUri.Segments.Length >= 6
                && resourceUri.Segments[5].TrimEnd('/').EqualsIgnoreCase("crosssells"))
            {
                resource += "/current/crosssells";
            }

            return resource + request.GetCookie(Constants.CacheCookieName);
        }
    }
}