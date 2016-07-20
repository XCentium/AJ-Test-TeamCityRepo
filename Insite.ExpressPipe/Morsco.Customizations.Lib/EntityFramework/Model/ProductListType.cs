using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.EntityFramework.Model
{
    [Table("ProductListType", Schema = "Custom")]
    public class ProductListType : EntityBase
    {
        public string ListType { get; set; }
        public string Name { get; set; }
        public IList<ProductList> ProductLists { get; set; }

        public ProductListType()
        {
            ProductLists = new List<ProductList>();
        }
    }
}
