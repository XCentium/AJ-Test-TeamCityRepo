using System;
using System.Text.RegularExpressions;

namespace Morsco.Customizations.Lib.Utils
{
    public static class ExtensionMethods
	{
		public static bool IsEmailAddress(this string str)
		{
			return Regex.IsMatch(str,
				@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
				@"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$",
				RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
		}
	}
}
