using System.ComponentModel.DataAnnotations.Schema;

namespace Morsco.Customizations.Lib.EntityFramework.Model
{
    [Table("UserRecentlyUsedCreditCard", Schema = "Custom")]
    public class UserRecentlyUsedCreditCard : Insite.Data.Entities.EntityBase
    {
        public string UserId { get; set; }
        public string ElementAccountId { get; set; }
        public string BillToId { get; set; }
    }
}
