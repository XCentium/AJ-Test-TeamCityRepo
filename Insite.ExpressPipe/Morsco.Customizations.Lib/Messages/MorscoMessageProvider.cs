using Insite.Core.Providers;

namespace Morsco.Customizations.Lib.Messages
{
    public class MorscoMessageProvider : MessageProvider
    {
        public virtual string Registration_TermsContent => GetMessage("Registration_TermsContent", "Invalid extended property name {0}.");
    }
}

