using System.Data.SqlClient;

namespace Morsco.PonderosaService.DataRepositories
{
    public class BaseRepository
	{
		public SqlParameter GetStringParameter(string name, string value)
		{
			return new SqlParameter(name, (value == null)? string.Empty: value);
		}
	}

}
