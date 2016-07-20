using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.PonderosaOrderUpdate.Interfaces
{
    public interface IPonderosaOrderUpdateService
    {
        Task<bool> GetOrderChanges();
    }
}

