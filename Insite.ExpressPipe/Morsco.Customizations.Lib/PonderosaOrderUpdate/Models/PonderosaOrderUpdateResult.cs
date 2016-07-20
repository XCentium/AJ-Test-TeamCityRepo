using Insite.Core.Services;

namespace Morsco.Customizations.Lib.PonderosaOrderUpdate.Models
{
    public class PonderosaOrderUpdateResult: ParameterBase
    {
        public PonderosaOrderUpdateResult(): base()
        {
        }

        public bool PonderosaUpdateCompleted
        {
            get;
            set;
        } 
        
    }
}
