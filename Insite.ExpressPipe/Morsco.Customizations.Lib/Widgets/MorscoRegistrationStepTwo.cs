using System.ComponentModel;
using Insite.ContentLibrary.ContentFields;
using Insite.ContentLibrary.Widgets;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.Widgets
{
    [DisplayName("ExpressPipe - Registration Step 2")]
    public class MorscoRegistrationStepTwo : ContentWidget
    {
        [RichTextContentField]
        public virtual string Body
        {
            get
            {
                return GetValue<string>("Body", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Body", value, FieldType.Variant);
            }
        }
    }
}

