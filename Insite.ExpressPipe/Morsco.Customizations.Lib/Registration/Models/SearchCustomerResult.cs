using Insite.Core.Services;

namespace Morsco.Customizations.Lib.Registration.Models
{
    public class SearchCustomerResult: ParameterBase
    {
        public SearchCustomerResult(): base()
        {
        }
        public string CustomerNumber { get; set; }
        public string CustomerSequence { get; set; }
        public string CompanyName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
    }
}
