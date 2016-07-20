using System;

namespace Morsco.Customizations.Lib.Registration.Models
{
    public class WarehouseDto 
    {
        public Guid WarehouseId { get; set; }
        public string ShipSite { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
