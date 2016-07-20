using System;

namespace Morsco.Customizations.Lib.CreditCardIntegration.Models
{
    public class CreditCardDto
    {
		public string Element_Acct_ID { get; set; }
		public string Card_Type { get; set; }
		public string Card_Number { get; set; }
		public string Card_Holder { get; set; }
		public string Expire_Date { get; set; }
		public string Auth_Type { get; set; }
		public string StreetAddress { get; set; }
		public string PostalCode { get; set; }
        public Boolean IsSelectedCard { get; set; }
    }
}
