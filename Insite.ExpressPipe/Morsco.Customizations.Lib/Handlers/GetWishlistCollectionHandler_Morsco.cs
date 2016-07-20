
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Data.Entities;
using Insite.Core.Services.Handlers;
using Insite.WishLists.Services.Handlers.Mappers;
using Insite.WishLists.Services.Parameters;
using Insite.WishLists.Services.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using Insite.WishLists.Services.Handlers;
using System.Web.Script.Serialization;

namespace Morsco.Customizations.Lib.Handlers
{
	public struct Branch
	{
		public string Address;
		public string BranchName;
	}

	[DependencyName("GetWishListCollectionHandler_Morsco")]
    public class GetWishlistCollectionHandler_Morsco : GetWishListCollectionHandler
    {

        public GetWishlistCollectionHandler_Morsco(IWishListHandlerMapper wishishListHandlerMapper, IHandlerFactory handlerFactory, IObjectToObjectMapper mapper)
            : base(wishishListHandlerMapper, handlerFactory, mapper)
        {
        }

        public override int Order
        {
            get
            {
                return 680;
            }
        }
        public override GetWishListCollectionResult Execute(IUnitOfWork unitOfWork, GetWishListCollectionParameter parameter, GetWishListCollectionResult result)
        {
            var warehouses = unitOfWork.GetRepository<Warehouse>()
                    .GetTable()
                    .Where(x => x.DeactivateOn > DateTime.Now || x.DeactivateOn == null)
                    .ToList();

			var whDictionary = new Dictionary<string, Branch>();

			foreach (var wh in warehouses)
			{
				var branch = new Branch
				{
					Address = wh.Address1,
					BranchName = wh.Description
				};
                if (whDictionary.ContainsKey(wh.ShipSite))
                {
                    whDictionary[wh.ShipSite] = branch;
                }
                else
                {
                    whDictionary.Add(wh.ShipSite, branch);
                }
			}
			var sortedWh = whDictionary.ToList().OrderBy(x => x.Value.BranchName);
			var jsonSerialiser = new JavaScriptSerializer();
			var jsonWarehouses = jsonSerialiser.Serialize(sortedWh);
			result.Properties["warehouses"] = jsonWarehouses;

			if (result.Properties.ContainsKey("warehouses"))
            {
                result.Properties["warehouses"] = jsonWarehouses;
            }
            else
            {
                result.Properties.Add("warehouses", jsonWarehouses);
            }
            return base.NextHandler.Execute(unitOfWork, parameter, result);
        }
    }
}

