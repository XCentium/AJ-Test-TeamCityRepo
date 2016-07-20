using System;
using System.Collections;
using System.Collections.Generic;

namespace Morsco.Customizations.Lib.BillToMin.Models
{
    public class CustomerMinModel
    {
        public string Id { get; set; }
        public ICollection<CustomerMinModel> ShipTos { get; set; } = new List<CustomerMinModel>();
        public string Label { get; set; }
    }
}
