using System;
using System.Linq;
using Insite.Catalog.Services;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.ProductList.Models;

namespace Morsco.Customizations.Lib.Repositories
{
    public class ProductListRepository : BaseRepository, IProductListRepository, IInterceptable
    {
        private const bool IgnoreCase = true;

        public ProductListRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService,
            IProductService productService)
            : base(unitOfWorkFactory, customerService, productService)
        {
        }

        public GetProductCollectionResult GetProductList(string listType, string customerNumber, string customerSequence, int maxRows)
        {
            if (string.IsNullOrWhiteSpace(listType))
            {
                throw new Exception("List Type parameter is required");
            }

            //CustomerNumber and CustomerSequence are set to blank in the DB, not null
            if (string.IsNullOrWhiteSpace(customerNumber))
            {
                customerNumber = String.Empty;
            }

            if (string.IsNullOrWhiteSpace(customerSequence))
            {
                customerSequence = String.Empty;
            }

            ProductListType productListType;
            if (!Enum.TryParse(listType, IgnoreCase, out productListType))
            {
                throw new Exception("listType parameter " + listType + " is invalid");
            }

            var unitOfWork = UnitOfWorkFactory.GetUnitOfWork();
            var productList =
                unitOfWork.GetRepository<EntityFramework.Model.ProductList>()
                    .GetTable()
                    .Where(x => x.ProductListType.ListType == listType);

            if (!String.IsNullOrWhiteSpace(customerNumber) && productListType != ProductListType.AllCust24Mo)
            {
                productList = productList.Where(x => x.CustomerNumber == customerNumber);
            }

            if (!String.IsNullOrWhiteSpace(customerSequence) && productListType == ProductListType.ShipToCust24Mo)
            {
                productList = productList.Where(x => x.CustomerSequence == customerSequence);
            }

            var products = productList.OrderByDescending(x => x.Frequency)
                .Take(maxRows)
                .Select(x => x.Product.Id)
                .ToList();

            var param = new GetProductCollectionParameter()
            {
                GetPrices = true,
                AllowedProductIds = products,
            };

            var result = ProductService.GetProductCollection(param);
            return result;
        }

    }
}
