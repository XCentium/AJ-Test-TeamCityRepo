using Morsco.Customizations.Lib.BillToMin.Models;

namespace Morsco.Customizations.Lib.Interfaces
{
    public interface IBillToMinRepository
    {
        BillToMinResult GetBillToMin(bool currentBillToOnly, bool includeExtraAddresses = true);
    }
}
