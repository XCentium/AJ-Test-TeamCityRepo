using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Core.WebApi.Interfaces;
using Insite.Dealers.Services.Parameters;
using Insite.Dealers.Services.Results;
using Insite.Dealers.WebApi.V1.ApiModels;
using Insite.Dealers.WebApi.V1.Mappers;
using Insite.Dealers.WebApi.V1.Mappers.Interfaces;

namespace Morsco.Customizations.Lib.Mappers
{
    public class GetDealerCollectionMapper_Morsco : GetDealerCollectionMapper, IGetDealerCollectionMapper, IWebApiMapper<DealerCollectionParameter, GetDealerCollectionParameter, GetDealerCollectionResult, DealerCollectionModel>, ISingletonLifetime, IDependency
    {
        public GetDealerCollectionMapper_Morsco(IGetDealerMapper getDealerMapper, IObjectToObjectMapper objectToObjectMapper, IUrlHelper urlHelper)
            : base(getDealerMapper, objectToObjectMapper, urlHelper)
        {

        }

        public override GetDealerCollectionParameter MapParameter(DealerCollectionParameter apiParameter, HttpRequestMessage request)
        {
            GetDealerCollectionParameter destination = new GetDealerCollectionParameter();
            if (apiParameter != null)
            {
                ObjectToObjectMapper.Map<DealerCollectionParameter, GetDealerCollectionParameter>(apiParameter, destination);
            }
            var queryString = request.GetQueryNameValuePairs();
            if (queryString != null)
            {
                KeyValuePair<string, string> category = queryString.FirstOrDefault(x => x.Key == "category");
                if (category.Value != null)
                {
                    destination.Properties.Add(category.Key, category.Value);
                }
            }
            return destination;
        }
    }
}