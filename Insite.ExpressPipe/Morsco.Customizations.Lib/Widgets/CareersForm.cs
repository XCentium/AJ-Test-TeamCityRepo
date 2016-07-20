using Insite.ContentLibrary.ContentFields;
using Insite.ContentLibrary.Widgets;
using Insite.Core.Providers;
using Insite.Data.Entities;
using System.Collections.Generic;
using System.ComponentModel;

namespace Morsco.Customizations.Lib.Widgets
{
    [DisplayName("ExpressPipe - Careers Form")]
    public class CareersForm : ContentWidget
    {
        private string emailIsInvalidErrorMessage;
        private string emailIsRequiredErrorMessage;
        private string fileIsRequiredErrorMessage;
        private string fileIsInvalidErrorMessage;
        private string nameIsRequiredErrorMessage = "Your name is required";

        [TextContentField(IsRequired = true)]
        public virtual string Title
        {
            get
            {
                return GetValue<string>("Title", "Apply for this position:", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Title", value, FieldType.Variant);
            }
        }

        public virtual string EmailIsInvalidErrorMessage
        {
            get
            {
                if (emailIsInvalidErrorMessage == null)
                {
                }
                return (emailIsInvalidErrorMessage = MessageProvider.Current.GetMessage("ContactUsForm_EmailIsInvalidErrorMessage", "Email Address is invalid."));
            }
        }

        public virtual string EmailIsRequiredErrorMessage
        {
            get
            {
                if (emailIsRequiredErrorMessage == null)
                {
                }
                return (emailIsRequiredErrorMessage = MessageProvider.Current.GetMessage("ContactUsForm_EmailIsRequiredErrorMessage", "Email Address is required."));
            }
        }

        [ListContentField(DisplayName = "Send Email To", IsRequired = true, RegExValidation = @"\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*", InvalidRegExMessage = "Invalid Email Address")]
        public virtual List<string> EmailTo
        {
            get
            {
                return GetValue<List<string>>("EmailTo", new List<string>(), FieldType.Variant);
            }
            set
            {
                SetValue<List<string>>("EmailTo", value, FieldType.Variant);
            }
        }

        public virtual string FileIsRequiredErrorMessage
        {
            get
            {
                if (fileIsRequiredErrorMessage == null)
                {
                }
                return (fileIsRequiredErrorMessage = MessageProvider.Current.GetMessage("ContactUsForm_FileIsRequiredErrorMessage", "File is required."));
            }
        }

        public virtual string FileisInvalidErrorMessage
        {
            get
            {
                if (fileIsInvalidErrorMessage == null)
                {
                }
                return (fileIsInvalidErrorMessage = MessageProvider.Current.GetMessage("ContactUsForm_FileIsInvalidErrorMessage", "File type is invalid."));
            }
        }

        [RichTextContentField(IsRequired = true)]
        public virtual string SuccessMessage
        {
            get
            {
                return GetValue<string>("SuccessMessage", "<p>Your application has been sent.</p>", FieldType.Variant);
            }
            set
            {
                SetValue<string>("SuccessMessage", value, FieldType.Variant);
            }
        }
        public virtual string NameIsRequiredErrorMessage
        {
            get
            {
                if (nameIsRequiredErrorMessage == null)
                {
                }
                return nameIsRequiredErrorMessage;
            }
        }
    }
}

