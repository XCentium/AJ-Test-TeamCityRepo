using System.Collections.Generic;

namespace Morsco.Customizations.Lib.BillTrust.Models
{
    public class BillTrustInvoiceRequest
    {
        public BillTrustInvoiceRequest()
        {
        }

        //   BillTrustEnvironment.Production, "17895", {}

        public string AccountNumber { get; set; }

        public List<string> Invoices { get; set; }

    }
}

