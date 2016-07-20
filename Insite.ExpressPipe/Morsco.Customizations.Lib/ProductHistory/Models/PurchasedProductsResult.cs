using System.Collections.Generic;
using Insite.Core.Services;
using Insite.Catalog.Services.Dtos;

namespace Morsco.Customizations.Lib.ProductHistory.Models
{
    public class PurchasedProductsResult: PagingParameterBase
    {
        public PurchasedProductsResult(): base()
        {
        }
        private IList<ProductDto> productList = new List<ProductDto>(); 
        public IList<ProductDto> ProductList { 
            get { return productList;  }
            set { productList = value; } 
        }
    }
}
