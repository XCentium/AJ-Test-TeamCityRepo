namespace Morsco.Customizations.Lib.ProductList.Models
{
    public class ProductListRequest
    {
        public ProductListRequest()
        {
            MaxRows = 16;
        }
        
        public string ListType { get; set; }
        
        public string CustomerNumber { get; set; }
        
        public string CustomerSequence { get; set; }

        public int MaxRows { get; set; }
    }
}
