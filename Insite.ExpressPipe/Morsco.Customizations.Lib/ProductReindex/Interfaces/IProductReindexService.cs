using System.Threading.Tasks;
using Morsco.Customizations.Lib.ProductReindex.Models;

namespace Morsco.Customizations.Lib.ProductReindex.Interfaces
{
    public interface IProductReindexService
    {
        Task<ProductReindexResult> Reindex(ProductReindexRequest request);

    }
}

