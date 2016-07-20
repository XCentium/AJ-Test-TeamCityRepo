using Insite.Core.Services;

namespace Morsco.Customizations.Lib.ProductReindex.Models
{
    public class ProductReindexResult: ParameterBase
    {
        public ProductReindexResult(): base()
        {
        }

        public bool ReindexCompleted
        {
            get;
            set;
        }
        

    }
}