using System.Threading.Tasks;
using Morsco.Customizations.Lib.BillToMin.Models;

namespace Morsco.Customizations.Lib.BillToMin.Interfaces
{
    public interface IBillToMinService
    {
        Task<BillToMinResult> GetBillToMin(BillToMinRequest request);
    }
}

