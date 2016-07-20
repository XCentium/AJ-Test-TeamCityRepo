//using System;
//using Insite.Core.Context;
//using Insite.Core.Interfaces.Data;
//using Insite.Core.Interfaces.Plugins.Pricing;
//using Insite.Data.Entities;
//using Insite.Data.Repositories.Interfaces;
//using Microsoft.Practices.ServiceLocation;

//namespace Morsco.Customizations.Lib.PricingService
//{
//    /// <summary>
//    /// The standard <see cref="IPricingServiceFactory"/> used to get <see cref="IPricingService"/> objects
//    /// </summary>
//    public class PricingServiceFactory : IPricingServiceFactory
//    {
//        protected IServiceLocator ServiceLocator;

//        /// <summary>
//        /// Dependency Injection constructor.
//        /// </summary>
//        /// <param name="serviceLocator">The ServiceLocator to use to resolve <see cref="IPricingService"/> from Ioc.</param>
//        public PricingServiceFactory(IServiceLocator serviceLocator)
//        {
//            ServiceLocator = serviceLocator;
//        }


//        public IPricingService GetPricingService(Guid? customerOrderId = null)
//        {
//            var unitOfWork = ServiceLocator.GetInstance<IUnitOfWorkFactory>().GetUnitOfWork();
//            var customerOrder = customerOrderId.HasValue ? unitOfWork.GetRepository<CustomerOrder>().Get(customerOrderId.Value) : null;
//            return
//                ServiceLocator.GetInstance<IPricingService>(
//                    customerOrderId == null || customerOrder.Type != "Quote" && customerOrder.Type != "Job" 
//                    ? unitOfWork.GetTypedRepository<IWebsiteConfigurationRepository>().GetOrCreateByName<string>(
//                        "PricingService", 
//                        customerOrder?.WebsiteId ?? SiteContext.Current.Website.Id) 
//                    : "Rfq");
//        }
//    }
//}
