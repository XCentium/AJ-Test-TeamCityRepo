using System;
using System.Web;

namespace Morsco.Customizations.Lib.Common
{
    public static class Helpers
    {
        public static bool GetShowOnlyPreviousPurchasedItems()
        {
            var check = false;
            if (HttpContext.Current.Request.Cookies["showOnlyPreviousPurchased"] != null)
            {
                {
                    check = Convert.ToBoolean(HttpContext.Current.Request.Cookies["showOnlyPreviousPurchased"].Value);
                }
                
            }

            return check;
        }

        public static void SetShowOnlyPreviousPurchasedItems(bool value)
        {
            var cookie = new HttpCookie("showOnlyPreviousPurchased");
            cookie.Value = value.ToString();
            HttpContext.Current.Response.SetCookie(cookie);
        }
    }
}