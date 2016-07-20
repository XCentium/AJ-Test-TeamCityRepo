using System;

namespace Morsco.Customizations.Lib.BillToMin.Models
{
    public class BillToMinRequest
    {
        public bool CurrentBillToOnly { get; set; } = false;
        public bool IncludeExtraAddresses { get; set; } = true;
    }
}
