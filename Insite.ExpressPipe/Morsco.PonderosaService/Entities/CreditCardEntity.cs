using System;

namespace Morsco.PonderosaService.Entities
{
    public class CreditCardEntity
	{
		public string ElementAcctID { get; set; }
		public string CardType { get; set; }
		public string CardNumber { get; set; }
		public string CardHolder { get; set; }
		public string ExpireDate { get; set; }
		public string AuthType { get; set; }
		public string StreetAddress { get; set; }
		public string PostalCode { get; set; }
		public Boolean IsSelectedCard { get; set; }
	}
}
