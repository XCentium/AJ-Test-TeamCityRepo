namespace Morsco.Customizations.Lib.CreditCardIntegration.Models
{
    public class CreditCardInitiateResult
	{
		public string RedirectUrl { get; set; }
		public string ContactId { get; set; }
		public string SetupResult { get; set; }
        public string ErrorMessage { get; set; }
	}
}
