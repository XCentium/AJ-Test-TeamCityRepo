namespace Morsco.Customizations.Lib.ProductReindex.Models
{
    public class ProductReindexRequest
    {
        public bool WaitForCompletion { get; set; } = true;
        public int WaitForCompletionTimeoutSec { get; set; } = 1800;
    }
}
