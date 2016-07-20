using Insite.Catalog.Services.Results;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IProductListRepository
    {
        GetProductCollectionResult GetProductList(string listType, string customerNumber, string customerSequence, int maxRows);
    }
}
