using Insite.Data.Providers.EntityFramework.EntityMappings;
using Morsco.Customizations.Lib.EntityFramework.Model;

namespace Morsco.Customizations.Lib.EntityFramework.Mapping
{
    public class ProductListTypeMapping : EntityBaseTypeConfiguration<ProductListType>
    {
        public ProductListTypeMapping()
        {
            HasMany(plt => plt.ProductLists);
        }
    }
}
