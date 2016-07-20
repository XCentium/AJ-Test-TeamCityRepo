using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.EmailService
{
    public class TriggeredSendDto
    {
        public Guid SendId { get; set; }
        public string CustomerKey { get; set; }
        public string Recipient { get; set; }
        public ExpandoObject Attributes { get; set; }
    }
}
