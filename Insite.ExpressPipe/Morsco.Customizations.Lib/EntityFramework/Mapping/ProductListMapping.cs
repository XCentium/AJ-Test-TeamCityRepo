using Insite.Data.Providers.EntityFramework.EntityMappings;

namespace Morsco.Customizations.Lib.EntityFramework.Mapping
{
    public class ProductListMapping: EntityBaseTypeConfiguration<Model.ProductList>
    {
        public ProductListMapping()
        {
            HasRequired(pl => pl.ProductListType);
            HasOptional(pl => pl.Customer);
            HasRequired(pl => pl.Product);
        }
    }
}
