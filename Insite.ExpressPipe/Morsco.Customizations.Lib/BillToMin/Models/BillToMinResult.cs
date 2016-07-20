using System.Collections.Generic;
using Insite.Core.Services;
using Insite.Catalog.Services.Dtos;

namespace Morsco.Customizations.Lib.BillToMin.Models
{
    public class BillToMinResult: PagingParameterBase
    {
        public IList<CustomerMinModel> BillTos { get; set; } = new List<CustomerMinModel>();
    }
}
