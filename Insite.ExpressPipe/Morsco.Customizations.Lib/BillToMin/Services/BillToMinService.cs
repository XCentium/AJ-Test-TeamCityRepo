using System.Threading.Tasks;
using Insite.Core.Services;
using Morsco.Customizations.Lib.Interfaces;
using Morsco.Customizations.Lib.BillToMin.Interfaces;
using Morsco.Customizations.Lib.BillToMin.Models;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;

namespace Morsco.Customizations.Lib.BillToMin.Services
{
    public class BillToMinService : ServiceBase, IBillToMinService, IInterceptable
    { 
        private readonly IBillToMinRepository _repository;

        public BillToMinService(IUnitOfWorkFactory unitOfWorkFactory, IBillToMinRepository repository)
            :base(unitOfWorkFactory)
        {
            _repository = repository;
        }

        public async Task<BillToMinResult> GetBillToMin(BillToMinRequest request)
        {
            var result = await Task.FromResult(
                _repository.GetBillToMin(request.CurrentBillToOnly, request.IncludeExtraAddresses)
            );
            
            return result;
        }
    }
}
