using System;
using Insite.Catalog.Services.Dtos;

namespace Morsco.Customizations.Lib.ProductList.Models
{
    public class ProductListItemDto : ProductDto
    {
        public string ProductId { get; set; }
        public string ProductErpNumber { get; set; }
        public int Frequency { get; set; }
        public int QtyShipped { get; set; }
        public DateTime LastOrderedDate { get; set; }
        public DateTime LastShippedDate { get; set; }
    }
}
