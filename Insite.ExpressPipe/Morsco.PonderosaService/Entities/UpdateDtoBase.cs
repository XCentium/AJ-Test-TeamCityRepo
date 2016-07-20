using System;
using System.Collections.Generic;

namespace Morsco.PonderosaService.Entities
{
    public class UpdateDtoBase
    {
        public Dictionary<string, object> Values = new Dictionary<string, object>();

        protected T GetDictionaryValue<T>(string key, T defaultValue = default(T))
        {
            return (Values.ContainsKey(key)) ? (T)Values[key] : defaultValue;
        }

        protected DateTime? GetDictionaryStringAsDate(string key, DateTime? defaultValue = null)
        {
            DateTime? result = null;

            if (Values.ContainsKey(key))
            {
                var dateStr = (string)Values[key];
                DateTime test;
                if (DateTime.TryParse(dateStr, out test))
                {
                    result = test;
                }
            }
            return result;
        }

        protected void SetDictionaryValue<T>(T value, string key)
        {
            //Todo:  If there is a need for it, we might have to delete dictionary kvp because we no longer want to set this value
            //Ponderosa only sets the values we send to it -- beyond the identifying values
            
            if (!typeof (T).IsGenericType || typeof (T).GetGenericTypeDefinition() != typeof (Nullable<>))
            {
                Values[key] = value;
            }
            //if it's a generic, have to send the value, after checking to see that it has value
            else
            {
                if (value != null)
                {
                    var type = Nullable.GetUnderlyingType(typeof(T));
                    Values[key] =  Convert.ChangeType(value, type);
                }
            }
        }
    }
}
