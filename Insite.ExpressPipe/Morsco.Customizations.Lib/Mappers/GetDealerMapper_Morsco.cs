using System;
using System.Linq;
using System.Net.Http;
using Insite.Core.Interfaces.Data;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi.Interfaces;
using Insite.Data.Entities;
using Insite.Dealers.Services;
using Insite.Dealers.Services.Results;
using Insite.Dealers.WebApi.V1.ApiModels;
using Insite.Dealers.WebApi.V1.Mappers;
using Insite.Dealers.WebApi.V1.Mappers.Interfaces;
using Insite.Dealers.Services.Dtos;

namespace Morsco.Customizations.Lib.Mappers
{
    public class GetDealerMapper_Morsco : GetDealerMapper, IGetDealerMapper
    {
        protected IDealerService DealerService { get; set; }
        protected readonly IUnitOfWorkFactory UnitOfWorkFactory;

        public GetDealerMapper_Morsco(IObjectToObjectMapper objectToObjectMapper, IUrlHelper urlHelper, IDealerService dealerService, IUnitOfWorkFactory unitOfWorkFactory)
            : base(objectToObjectMapper, urlHelper)
        {
            DealerService = dealerService;
            UnitOfWorkFactory = unitOfWorkFactory;
        }

        public override DealerModel MapResult(GetDealerResult serviceResult, HttpRequestMessage request)
        {
            var model = base.MapResult(serviceResult, request);
            DealerModel dealer = ObjectToObjectMapper.Map<DealerDto, DealerModel>(serviceResult.Dealer);
            //var dealer = model;
            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            var dealerProperties = unitOfWork.GetRepository<CustomProperty>().GetTable().Where(x => x.ParentId == model.Id);
            if (dealer != null)
            {
                foreach (var prop in dealerProperties)
                {
                    model.Properties.Add(prop.Name, prop.Value);
                }

                string[] customFields = {"productCategories", "hours", "managerEmail", "images", "emergencyNum"};
                
                foreach (var field in customFields)
                {
                    var prop = dealer.Properties.FirstOrDefault(x => x.Key.Equals(field, StringComparison.CurrentCultureIgnoreCase));
                    if (!string.IsNullOrEmpty(prop.Value))
                    {
                        if (!model.Properties.ContainsKey(prop.Key))
                        {
                            model.Properties.Add(prop.Key, prop.Value);
                        }
                        else
                        {
                            model.Properties[prop.Key] = prop.Value;
                        }
                        
                    }
                }

            }
            return model;
        }
    }
}