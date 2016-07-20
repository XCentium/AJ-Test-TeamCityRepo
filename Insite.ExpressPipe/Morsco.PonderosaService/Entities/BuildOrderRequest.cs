using System.Collections.Generic;

namespace Morsco.PonderosaService.Entities
{
    public class BuildOrderRequest
    {
        public IDictionary<string, object> OrderHeader { get; set; }
        public IList<IDictionary<string, object>> OrderDetail { get; set; }
    }
}
