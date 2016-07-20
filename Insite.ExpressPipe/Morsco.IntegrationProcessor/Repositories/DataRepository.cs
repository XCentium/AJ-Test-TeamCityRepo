using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using Insite.Data.Entities;
using Morsco.IntegrationProcessor.Helper;

namespace Morsco.IntegrationProcessor.Repositories
{
	public class DataRepository
	{
		public DataTable GetWarehouseData(string shipSite)
		{
			DataTable dtWarehouse = new DataTable(Constants.Warehouse);
            var connectionSetting = GetConnectionSetting();

			if (shipSite != string.Empty)
			{
                using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
				{
					sqlConnection.Open();
					if (sqlConnection.State == ConnectionState.Open)
					{
						string sqlQuery = "SELECT * FROM Warehouse WHERE ShipSite = @ShipSite";
						var cmd = new SqlCommand(sqlQuery, sqlConnection);
						cmd.Parameters.Add(new SqlParameter("@ShipSite", shipSite));
						var dataReader = cmd.ExecuteReader();
						dtWarehouse.Load(dataReader);
					}
				}
			}
			return dtWarehouse;
		}
        public string GetCarrierName(string carrierId )
        {
            var carrierName = string.Empty;
            var connectionSetting = GetConnectionSetting();

            using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State != ConnectionState.Open) return carrierName;
                const string sqlQuery = "SELECT Name FROM Carrier WHERE Id = @CarrierId";
                var cmd = new SqlCommand(sqlQuery, sqlConnection);
                cmd.Parameters.Add(new SqlParameter("@CarrierId", carrierId));
                var dataReader = cmd.ExecuteReader();
                if (dataReader.HasRows && dataReader.Read())
                {
                    carrierName = dataReader["Name"].ToString();
                }
            }
            return carrierName;
        }



        public DataRow GetWebSite(string webSiteName)
		{
			var webSites = new DataTable(Constants.WebSite);
		    DataRow webSite;
            var connectionSetting = GetConnectionSetting();

			using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
			{
				sqlConnection.Open();
				if (sqlConnection.State == ConnectionState.Open)
				{
					var sqlQuery = "SELECT * FROM WebSite WHERE Name = @WebSiteName";
					var cmd = new SqlCommand(sqlQuery, sqlConnection);
					cmd.Parameters.Add(new SqlParameter("@WebSiteName", webSiteName));
					var dataReader = cmd.ExecuteReader();
					webSites.Load(dataReader);

					if (webSites.Rows.Count > 0)
					{
						webSite = webSites.Rows[0];
					}
					else
					{
						throw new Exception($"Website ({webSiteName}) was not found.");
					}
				}
				else
				{
					throw new Exception($"Could not open connection for ({connectionSetting.ConnectionString}) ");
				}
			}
			return webSite;
		}

        public DataTable GetEclipseControlFileData()
        {
            var controlFileData = new DataTable();
            var connectionSetting = GetConnectionSetting();
            using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    var sqlQuery = "SELECT * FROM Custom.EclipseControlFileSetting";
                    var cmd = new SqlCommand(sqlQuery, sqlConnection);
                    var dataReader = cmd.ExecuteReader();
                    controlFileData.Load(dataReader);
                }
            }
            return controlFileData;
        }

        public int GetErpNumber(Guid productId)
        {
            var connectionSetting = GetConnectionSetting();
            int result = 0;

            using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
            {
                DataTable tbl = new DataTable();
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    var sqlQuery = $"SELECT ErpNumber FROM Product (NOLOCK) WHERE Id = '{productId}'";
                    var cmd = new SqlCommand(sqlQuery, sqlConnection);
                    var dataReader = cmd.ExecuteReader();
                    tbl.Load(dataReader);
                    if (tbl.Rows.Count == 0)
                    {
                        throw new ArgumentException($"Product ID ({productId}) not found");
                    }
                    var test = tbl.Rows[0]["ErpNumber"].ToString();
                    if (!int.TryParse(test, out result))
                    {
                        throw new Exception($"Product Id ({productId}) has non-numeric ErpNumber ({test})");
                    }
                }
            }
            return result;
        }

        public void UpdateEclipseOrderResponseDetails(string erpOrderNumber, string orderStatus, string webOrderNumber,
			string userName, string companyName, string shipDate)
		{
            var connectionSetting = GetConnectionSetting();

			if (erpOrderNumber != string.Empty)
			{
                using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
				{
					sqlConnection.Open();
					if (sqlConnection.State == ConnectionState.Open)
					{

					    var cmd = new SqlCommand("Custom.UpdateSubmittedOrder", sqlConnection) {CommandType = CommandType.StoredProcedure};
					    cmd.Parameters.Add(new SqlParameter("@WebOrderNumber", webOrderNumber));
						cmd.Parameters.Add(new SqlParameter("@ERPOrderNumber", erpOrderNumber));
						cmd.Parameters.Add(new SqlParameter("@OrderStatus", orderStatus));
						cmd.Parameters.Add(new SqlParameter("@OrderedBy", userName));
						cmd.Parameters.Add(new SqlParameter("@CompanyName", companyName));
						cmd.Parameters.Add(new SqlParameter("@ShipDate", shipDate));
						cmd.Parameters.Add(new SqlParameter("@User", userName));
					    try
					    {
					        cmd.ExecuteNonQuery();
					    }
					    catch (Exception)
					    {
					        throw;
					    }
					}
				}
			}
		}

		public void UpdateEclipseQuoteRequestDetails(string erpOrderNumber, string webOrderNumber, string userName,
			string companyName)
		{
            var connectionSetting = GetConnectionSetting();

			if (erpOrderNumber != string.Empty)
			{
                using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
				{
					sqlConnection.Open();
					if (sqlConnection.State == ConnectionState.Open)
					{
					    var cmd = new SqlCommand("Custom.UpdateSubmittedRfq", sqlConnection) {CommandType = CommandType.StoredProcedure};
					    cmd.Parameters.Add(new SqlParameter("@WebOrderNumber", webOrderNumber));
						cmd.Parameters.Add(new SqlParameter("@ERPOrderNumber", erpOrderNumber));
						cmd.Parameters.Add(new SqlParameter("@CompanyName", companyName));
						cmd.Parameters.Add(new SqlParameter("@User", userName));
						cmd.ExecuteNonQuery();
					}
				}
			}
		}

		public string GetApplicationSetting(string name)
		{
            var connectionSetting = GetConnectionSetting();

			var appSetting = string.Empty;
			using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
			{
				sqlConnection.Open();
				if (sqlConnection.State == ConnectionState.Open)
				{
					var cmd = $"SELECT S.Name, S.Value FROM ApplicationSetting S WHERE S.Name = '{name}'";
					var sqlCmd = new SqlCommand(cmd, sqlConnection);
					var cmdResult = sqlCmd.ExecuteReader();

					while (cmdResult.Read())
					{
						appSetting = cmdResult["Value"].ToString();
					}

				}

			}

			return appSetting;
		}

        public bool UpsertApplicationSetting(string name, string value, string userName)
        {
            var updatedAppSetting = false;
            var connectionSetting = GetConnectionSetting();

            using (var sqlConnection = new SqlConnection(connectionSetting.ConnectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    var cmd = new SqlCommand("Custom.UpdateApplicationSettings", sqlConnection) {CommandType = CommandType.StoredProcedure};
                    cmd.Parameters.Add(new SqlParameter("@Name", name));
                    cmd.Parameters.Add(new SqlParameter("@Value", value));
                    cmd.Parameters.Add(new SqlParameter("@UserName", userName));
                    int executeNonQuery = cmd.ExecuteNonQuery();
                    updatedAppSetting = Convert.ToBoolean(executeNonQuery);
                }
            }
            return updatedAppSetting;
        }

        private ConnectionStringSettings GetConnectionSetting()
        {
            var connectionSetting = ConfigurationManager.ConnectionStrings["Insite.Commerce"];
            if (string.IsNullOrEmpty(connectionSetting?.ConnectionString))
            {
                throw new Exception("Fatal error: missing connection string in web.config file");
            }
            return connectionSetting;
        }
	}


}
