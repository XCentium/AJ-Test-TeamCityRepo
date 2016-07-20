using System;
using System.Collections.Generic;
using Morsco.PonderosaService.Entities;

namespace Morsco.Customizations.Lib.CreditCardIntegration.Models
{
    public class CreditCardsResult
	{
		public List<CreditCardEntity> CreditCards { get; set; }
		public Boolean Success { get; set; }
		public string ErrorMessage { get; set; }
	}
}
