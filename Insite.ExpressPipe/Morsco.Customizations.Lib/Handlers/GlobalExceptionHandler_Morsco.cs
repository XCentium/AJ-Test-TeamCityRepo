// --------------------------------------------------------------------------------------------------------------------
// <copyright file="ExceptionHandler.cs" company="Insite Software">
//   Copyright © 2015. Insite Software. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

using System;
using System.Linq;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.Results;
using Insite.Core.Exceptions;
using Insite.Core.Interfaces.Dependency;

namespace Morsco.Customizations.Lib.Handlers
{
    /// <summary>The global exception handler.</summary>
    public class GlobalExceptionHandler_Morsco : ExceptionHandler, IDependency
    {
        /// <summary>The handle.</summary>
        /// <param name="context">The context.</param>
        public override void Handle(ExceptionHandlerContext context)
        {
            // ReSharper disable once JoinDeclarationAndInitializer
            var includeStackTrace = context.Exception is InvalidAddressException;

#if DEBUG
            includeStackTrace = true;
#endif

            var config = context.RequestContext.Configuration;

            //Customization Point.  Remove Odata from the formatters temporarily
            //By Darwin -- to be fixed in June 2016 release
            var formatters = config.Formatters.Where(o => !o.GetType().Name.ContainsCaseInsensitive("odata"));

            // ReSharper disable once ConditionIsAlwaysTrueOrFalse
            context.Result = new ExceptionResult(
                context.Exception,
                includeStackTrace,
                config.Services.GetContentNegotiator(),
                context.Request,
                formatters);

            base.Handle(context);
        }
    }
}