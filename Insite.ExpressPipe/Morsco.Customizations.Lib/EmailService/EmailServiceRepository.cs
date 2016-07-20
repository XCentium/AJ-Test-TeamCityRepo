using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Morsco.Customizations.Lib.EmailService;

namespace Morsco.Customizations.Lib.EmailService
{
    public class EmailServiceRepository
    {
        public void InsertTriggeredSends(IList<TriggeredSendDto> triggeredSendDtos)
        {
            using (var service = new MorscoEmailServiceDatabase())
            { 
                service.Configuration.AutoDetectChangesEnabled = false;

                service.TriggeredSends.AddRange
                    (
                        triggeredSendDtos.Select(x => new TriggeredSend
                        {
                            SendId = x.SendId,
                            CustomerKey = x.CustomerKey,
                            Recipient = x.Recipient,
                            Attributes = JsonConvert.SerializeObject(x.Attributes),
                            CreatedUTC = DateTime.Now,
                            SentUTC = null
                        })
                   );
                service.SaveChanges();
            }
        }
    }
}
