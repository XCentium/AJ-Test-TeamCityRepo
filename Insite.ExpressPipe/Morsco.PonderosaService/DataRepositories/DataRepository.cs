using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;

namespace Morsco.PonderosaService.DataRepositories
{
    public class DataRepository: BaseRepository
	{
		private string connectionString = string.Empty;

		public DataRepository()
		{
			ConnectionStringSettings mySetting = ConfigurationManager.ConnectionStrings["Insite.Commerce"];
            if (mySetting == null || string.IsNullOrEmpty(mySetting.ConnectionString))
			{
				throw new Exception("Fatal error: missing connecting string in App.config file");
			}
			connectionString = mySetting.ConnectionString;
		}

        public List<string> GetOrderHeaderColumnList()
        {
            var orderHeaderList = new List<string>();


            using (var sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    string sqlQuery = "SELECT * FROM Custom.EclipseTableDefinition WHERE TableName='OrderHeader' Order By ColumnIndex";
                    var cmd = new SqlCommand(sqlQuery, sqlConnection);
                    var dataReader = cmd.ExecuteReader();
                    var orderHeaderDef = new DataTable();
                    orderHeaderDef.Load(dataReader);
                    orderHeaderList = orderHeaderDef.AsEnumerable().Select(x => x["ColumnName"].ToString()).ToList();
                }

            }
            return orderHeaderList;

        }

        public List<string> GetOrderDetailColumnList()
        {
            var orderDetailList = new List<string>();
            using (var sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    string sqlQuery = "SELECT * FROM Custom.EclipseTableDefinition WHERE TableName='OrderDetail' Order By ColumnIndex";
                    var cmd = new SqlCommand(sqlQuery, sqlConnection);
                    var dataReader = cmd.ExecuteReader();
                    var orderDef = new DataTable();
                    orderDef.Load(dataReader);
                    orderDetailList = orderDef.AsEnumerable().Select(x => x["ColumnName"].ToString()).ToList();
                }
            }
            return orderDetailList;

        }

		public DataTable GetWarehouseData(string ShipSite)
		{
			DataTable dtWarehouse = new DataTable(ServiceConstants.Warehouse);

			if (ShipSite != string.Empty)
			{
				using (var sqlConnection = new SqlConnection(connectionString))
				{
					sqlConnection.Open();
					if (sqlConnection.State == ConnectionState.Open)
					{
						string sqlQuery = "SELECT * FROM Warehouse WHERE ShipSite = @ShipSite";
						var cmd = new SqlCommand(sqlQuery, sqlConnection);
						cmd.Parameters.Add(new SqlParameter("@ShipSite", ShipSite));
						var dataReader = cmd.ExecuteReader();
						dtWarehouse.Load(dataReader);
					}
				}
			}
			return dtWarehouse;
		}

        /// <summary>
        /// Get dictionary for a list of products indicating whether they're catalog products in a website.
        /// </summary>
        /// <param name="order"></param>
        /// <returns></returns>
        public List<string> GetCatalogProductsForOrder(OrderHeader order)
        {
            var nl = Environment.NewLine;
            var query = string.Format(
                "SELECT P.ErpNumber"
                + nl + "FROM CustomerOrder CO (NOLOCK)"
                + nl + "JOIN Website WS (NOLOCK) ON WS.ID = CO.WebSiteID"
                + nl + "JOIN OrderLine OL (NOLOCK) ON OL.CustomerOrderID = CO.ID"
                + nl + "JOIN Product P (NOLOCK) ON P.ID = OL.ProductID"
                + nl + "JOIN CustomProperty CP (NOLOCK) ON CP.ParentId = OL.ProductID"
                + nl + "                                AND CP.Name = 'CatalogWebSite'"
                + nl + "			                    AND CP.Value LIKE '%' + WS.Name + '%'"
                + nl + "WHERE OrderNumber = '{0}'", order.OrderNo);

            var queryResult = new DataTable();
            using (var sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                if (sqlConnection.State == ConnectionState.Open)
                {
                    var cmd = new SqlCommand(query, sqlConnection);
                    var dataReader = cmd.ExecuteReader();
                    queryResult.Load(dataReader);
                }
            }

            //Query returns the true values
            var result = queryResult.Rows.Cast<DataRow>().Select(row => (string)row["ErpNumber"]).ToList();

            return result;
        }

    }
}
