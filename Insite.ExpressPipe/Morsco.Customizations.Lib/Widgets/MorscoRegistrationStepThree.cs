using System.ComponentModel;
using Insite.ContentLibrary.ContentFields;
using Insite.ContentLibrary.Widgets;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.Widgets
{
    [DisplayName("ExpressPipe - Registration Step 3")]
    public class MorscoRegistrationStepThree : ContentWidget
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

        [RichTextContentField]
        public virtual string Terms
        {
            get
            {
                return GetValue<string>("Terms", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Terms", value, FieldType.Variant);
            }
        }
    }
}

