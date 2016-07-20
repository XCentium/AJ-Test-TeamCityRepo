using System.Collections.Generic;
using Insite.Core.Services;
using Insite.Catalog.Services.Dtos;

namespace Morsco.Customizations.Lib.ProductList.Models
{
    public class ProductListResult: PagingParameterBase
    {
        public ProductListResult(): base()
        {
        }
        private IList<ProductDto> productList = new List<ProductDto>(); 
        public IList<ProductDto> ProductList { 
            get { return productList;  }
            set { productList = value; } 
        }
    }
}
