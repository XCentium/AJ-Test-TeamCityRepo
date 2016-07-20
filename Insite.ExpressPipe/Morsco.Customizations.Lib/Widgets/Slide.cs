using System.ComponentModel;
using Insite.ContentLibrary.ContentFields;
using Insite.ContentLibrary.Widgets;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.Widgets
{
    [DisplayName("ExpressPipe - Slide")]
    public class Slide : ContentWidget
    {
        [FilePickerField(SortOrder=10, ResourceType="ImageFiles")]
        public virtual string BackgroundImage
        {
            get
            {
                return GetValue<string>("BackgroundImage", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("BackgroundImage", value, FieldType.Variant);
            }
        }

        [TextContentField]
        public virtual string Title
        {
            get
            {
                return GetValue<string>("Title", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Title", value, FieldType.Variant);
            }
        }

        [TextContentField]
        public virtual string Text
        {
            get
            {
                return GetValue<string>("Text", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Text", value, FieldType.Variant);
            }
        }

        [TextContentField]
        public virtual string Link
        {
            get
            {
                return GetValue<string>("Link", "", FieldType.Variant);
            }
            set
            {
                SetValue<string>("Link", value, FieldType.Variant);
            }
        }
    }
}

