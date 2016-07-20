using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Insite.ContentLibrary.Widgets;
using Insite.Core.Context;
using Insite.Data.Entities;

namespace Morsco.Customizations.Lib.Widgets
{
    [DisplayName("ExpressPipe - Categories")]
    public class Categories : ContentWidget
    {
        private List<Category> _categories = new List<Category>(); 
        public virtual List<Category> Cats
        {
            get
            {
                var allCategories = new List<Category>(SiteContext.Current.Website.Categories);
                _categories = allCategories
                    .Where(x => x.Parent == null)
                    .Where(x => x.DeactivateOn == null || x.DeactivateOn > DateTime.Now)
                    .Where(x => x.ActivateOn == null || x.ActivateOn <= DateTime.Now)
                    .Select(x => x).ToList();

                return _categories;
            }
        }
    }
}

