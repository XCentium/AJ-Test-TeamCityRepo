using System;
using System.ComponentModel.DataAnnotations.Schema;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.EntityFramework.Model {

    [Table("ProductList", Schema="Custom")]
    public class ProductList : EntityBase
    {
        public ProductListType ProductListType { get; set; }
        public Guid ProductListTypeId { get; set; }

        public Customer Customer { get; set; }
        public Guid? CustomerId { get; set; }

        public Insite.Data.Entities.Product Product { get; set; }
        public Guid ProductId { get; set; }

        public string CustomerNumber { get; set; }
        public string CustomerSequence { get; set; }
        public string ProductErpNumber { get; set; }
        public int Frequency { get; set; }
        public int QtyOrdered { get; set; }
        public int QtyShipped { get; set; }
        public DateTime LastOrderedDate { get; set; }
        public DateTime LastShippedDate { get; set; }
    }
}
