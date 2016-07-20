using Insite.Core.Interfaces.Data;
using Insite.Integration.WebService;

namespace Morsco.Customizations.Lib.Services
{
    public class IntegrationJobSchedulingService_Morsco: IntegrationJobSchedulingService
    {
        public IntegrationJobSchedulingService_Morsco(IUnitOfWorkFactory unitOfWorkFactory)
            :base(unitOfWorkFactory)
        { }

        //Customization Point:  For some reason, Insite threw a Not ImplementedException as the guts of this proc.
        //This caused exception and not waiting for the job to finish.  So make this an empty procedure.
        protected override void SendSignalRMessage(Insite.Data.Entities.IntegrationJob integrationJob)
        {}
    }
}
