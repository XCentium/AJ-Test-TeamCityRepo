namespace Morsco.Customizations.Lib.CreditCardIntegration.Models
{
    public class AddCardRequest
	{
		public string CardHolderName { get; set; }
		public string BillingAddress { get; set; }
		public string City { get; set; }
		public string State { get; set; }
		public string Zip { get; set; }
	}
}
