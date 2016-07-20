using System;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Utilities;
using Insite.Core.Services;
using Insite.Data.Entities;
using Insite.Dealers.Services.Handlers;
using Insite.Dealers.Services.Handlers.Interfaces;
using Insite.Dealers.Services.Parameters;
using Insite.Dealers.Services.Results;

namespace Morsco.Customizations.Lib.Handlers
{
    [DependencyName("GetDealerHandler_Morsco")]
    public class GetDealerHandler_Morsco : GetDealerHandler
    {
        public GetDealerHandler_Morsco(IDealerProvider dealerProvider, IHtmlContentProvider htmlContentProvider)
            : base(dealerProvider, htmlContentProvider)
        {
        }
        public override GetDealerResult Execute(IUnitOfWork unitOfWork, GetDealerParameter parameter, GetDealerResult result)
        {
            try
            {
                var dealer = unitOfWork.GetRepository<Dealer>().Get(parameter.DealerId);
                var dto = MapDealerToDealerDto(dealer, unitOfWork);
                if (dealer != null && dto != null)
                {
                    result.Dealer = dto;

                    if (dealer.Manager != null && !string.IsNullOrEmpty(dealer.Manager))
                    {
                        result.Properties.Add("Manager", dealer.Manager);
                    }
                    return result;
                }
                result.SubCode = SubCode.NotFound;
            }

            catch (Exception exception)
            {
                var item = new ResultMessage
                {
                    Message = "500 Internal Server Error",
                    Name = "StatusCode"
                };
                result.Messages.Add(item);
                var message2 = new ResultMessage
                {
                    Message = exception.Message,
                    Name = exception.GetType().FullName
                };
                result.Messages.Add(message2);
            }
            return CreateErrorServiceResult(result, SubCode.GeneralFailure, null);
        }

        public override int Order => 200;
    }
}

