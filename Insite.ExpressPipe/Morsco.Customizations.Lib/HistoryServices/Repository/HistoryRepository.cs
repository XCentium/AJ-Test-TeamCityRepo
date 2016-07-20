using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using Insite.Core.Interfaces.Dependency;
using Morsco.Customizations.Lib.HistoryServices.Interfaces;
using Morsco.Customizations.Lib.HistoryServices.Models;
using Newtonsoft.Json;

namespace Morsco.Customizations.Lib.HistoryServices.Repository
{
    public class HistoryRepository: IHistoryRepository, IInterceptable
    {
        private string ConnectionString
        {
            get
            {
                var config = ConfigurationManager.ConnectionStrings["Insite.Commerce"];
                if (string.IsNullOrEmpty(config?.ConnectionString))
                {
                    throw new Exception("Fatal error: missing connecting string in App.config file");
                }
                return config.ConnectionString;
            }
        }
        public string GetAgingBuckets(GetAgingBucketsRequest rqst)
        {
            var dataTable = GetAgingData(rqst.CustomerNumber, rqst.CustomerSequence);
            return SerializeSingleRow(dataTable);
        }

        private string SerializeSingleRow(DataTable table)
        {
            if (table.Rows.Count != 1)
            {
                throw new Exception($"Unexpected number of rows ({table.Rows.Count}) returned.");
            }
            return JsonConvert.SerializeObject(table.Rows[0].Table);
        }

        private DataTable GetAgingData(string customerNumber, string customerSequence)
        {
            var dt = new DataTable();
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                var command = new SqlCommand("Custom.SelectAgingBuckets", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.Add(new SqlParameter("@CustomerNumber", customerNumber ?? (object)DBNull.Value));
                command.Parameters.Add(new SqlParameter("@CustomerSequence", customerSequence ?? (object)DBNull.Value));

                var dataReader = command.ExecuteReader();
                dt.Load(dataReader);

                conn.Close();
            }
            return dt;
        }

        public string GetShipments(GetShipmentsRequest rqst)
        {
            const string sqlQuery = @"Select "
                                    + "oh.ERPOrderNumber as ShipmentNumber, "
                                    + "FORMAT(oh.OrderDate, 'M/d/yyyy') as ShipDate, "
                                    + "oh.ERPOrderNumber as ErpOrderNumber, "
                                    + "oh.CustomerPO as CustomerPO, "
                                    + "cp3.Value OrderedBy, "
                                    + "FORMAT(oh.OrderDate, 'M/d/yyyy') as OrderDate, "
                                    + "oh.Id as ShipmentPageId, "
                                    + "FORMAT(oh.OrderTotal, 'C', 'en-us') as Total, "
                                    + "oh.Status as Shipped, "
                                    + "oh.Status as Status, "
                                    + "cp.Value CompanyName, "
                                    + "cp2.Value LastShipDate, "
                                    + "ISNULL(cp4.Value,'') as InvoiceDate "
                                    + "FROM OrderHistory oh (NOLOCK)"
                                    +
                                    "JOIN CustomProperty cp (NOLOCK) ON cp.ParentID = oh.ID AND cp.Name = 'CompanyName' "
                                    +
                                    "JOIN CustomProperty cp2 (NOLOCK) ON cp2.ParentID = oh.ID AND cp2.Name = 'LastShipDate' "
                                    +
                                    "JOIN CustomProperty cp3 (NOLOCK) ON cp3.ParentID = oh.ID AND cp3.Name = 'OrderedBy' "
                                    +
                                    "LEFT JOIN CustomProperty cp4 (NOLOCK) ON cp4.ParentID = oh.ID AND cp4.Name = 'InvoiceDate'"
                //Master orders with the generation expansion don't have .001 extensions, while children do (although they don't show in the page)
                //So this construct will work at this point
                                    + "Where ERPOrderNumber like @ErpOrderNumber + '.%'"
                                    + "Order By oh.Status desc, oh.ErpOrderNumber";

            var dt = new DataTable();
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                var cmd = new SqlCommand(sqlQuery, conn);
                cmd.Parameters.Add(new SqlParameter("@ErpOrderNumber", rqst.ErpOrderNumber));
                var dataReader = cmd.ExecuteReader();
                dt.Load(dataReader);
            }

            return JsonConvert.SerializeObject(dt);
        }



        public string GetOrderHistoryLines(GetOrderHistoryLinesRequest rqst)
        {
            var sqlQuery = "Select oh.id, "
                           + "ohl.Status, "
                           + "ohl.LineNumber, "
                           + "ohl.ProductERPNumber, "
                           + "REPLACE(ohl.Description, '\"', '\\\"') as Description, "
                           + "CONVERT(int,ohl.QtyOrdered) as QtyOrdered, "
                           + "CONVERT(int, ohl.QtyShipped) as QtyShipped, "
                           + "ohl.UnitOfMeasure, "
                           + "CONVERT(Decimal(18,2), ohl.UnitPrice) as UnitPrice, "
                           + "CONVERT(Decimal(18,2), "
                           + "ohl.LineTotal) as LineTotal, "
                           + "REPLACE(p.ShortDescription, '\"', '\\\"') as ShortDescription, "
                           + "REPLACE(p.ERPDescription, '\"', '\\\"') as ERPDescription, "
                           + "p.ID as ProductId, "
                           + "p.Sku, "
                           + "p.SmallImagePath, "
                           + "cp3.Value as Brand, "
                           + "P.ManufacturerItem as  MfcNumber, "
                           + "OHL.Notes as Notes, "
                           + "ISNULL(cp.Value, 0) NumOfShipments, "
                           + "ISNULL(cp2.Value, '') as ShipmentDate "
                           + "FROM OrderHistory oh  "
                           + "JOIN OrderHistoryLine ohl on ohl.OrderHistoryId = oh.Id  "
                           + "JOIN Product P on p.ERPNumber = ohl.ProductERPNumber "
                           + "LEFT JOIN CustomProperty cp ON cp.ParentID = oh.ID AND cp.Name = 'GenerationCount' "
                           + "LEFT JOIN CustomProperty cp2 ON cp2.ParentID = oh.ID AND cp2.Name = 'LastShipDate' "
                           + "LEFT JOIN CustomProperty cp3 ON cp3.ParentID = P.ID AND cp3.Name = 'ManufacturerName' "
                           + $"Where oh.ERPOrderNumber = '{rqst.ErpOrderNumber}' Order By ohl.LineNumber";

            var dt = new DataTable();
            using (SqlConnection conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                var cmd = new SqlCommand(sqlQuery, conn);
                cmd.Parameters.Add(new SqlParameter("@ErpOrderNumber", rqst.ErpOrderNumber));
                var dataReader = cmd.ExecuteReader();
                dt.Load(dataReader);

                foreach (DataRow product in dt.Rows)
                {
                    if (!string.IsNullOrEmpty(product["ProductId"].ToString()))
                    {
                        var sqlQueryDoc = $"SELECT * from Document WHERE ParentId = '{product["ProductId"]}'";
                        var cmd2 = new SqlCommand(sqlQueryDoc, conn);
                        var productDocument = cmd2.ExecuteReader();

                        while (productDocument.Read())
                        {
                            var documentType = productDocument["DocumentType"].ToString();
                            var filePath = productDocument["FilePath"].ToString();

                            if (!dt.Columns.Contains(documentType))
                            {
                                dt.Columns.Add(documentType, typeof(string));
                            }
                            product[documentType] = filePath;
                        }
                        productDocument.Close();
                    }
                }
            }
            return JsonConvert.SerializeObject(dt);
        }

        public bool InDateRange(DateTime from, DateTime to, DateTime date)
        {
            return (date > from && date <= to);
        }

        public MemoryStream DownloadInvoicesCsvByIdList(DownloadInvoicesRequest rqst)
        {
            var agingData = GetAgingData(string.Empty, string.Empty);

            var currentStart = new DateTime();
            var currentEnd = new DateTime();
            var date31To60Start = new DateTime();
            var date31To60End = new DateTime();
            var date61To90Start = new DateTime();
            var date61To90End = new DateTime();
            var date91To120Start = new DateTime();
            var date91To120End = new DateTime();

            foreach (DataRow row in agingData.Rows)
            {
                currentStart = Convert.ToDateTime(row["CurrentStart"].ToString());
                currentEnd = Convert.ToDateTime(row["CurrentEnd"].ToString());
                date31To60Start = Convert.ToDateTime(row["31-60Start"].ToString());
                date31To60End = Convert.ToDateTime(row["31-60End"].ToString());
                date61To90Start = Convert.ToDateTime(row["61-90Start"].ToString());
                date61To90End = Convert.ToDateTime(row["61-90End"].ToString());
                date91To120Start = Convert.ToDateTime(row["91-120Start"].ToString());
                date91To120End = Convert.ToDateTime(row["91-120End"].ToString());
            }

            var sqlQuery = @"Select (SELECT CASE WHEN IsOpen = '0' THEN 'Closed' ELSE 'Open' END) as Status,
		                        CustomerSequence as [Acct #],
		                        ISNULL(CP1.Value,'') as [Job Name],
		                        CustomerPO as [PO #],
		                        InvoiceNumber as [Inv #],
		                        CAST(InvoiceDate as DATETIME) as [Inv Date],
		                        CAST(DueDate as DATETIME) as [Due Date],
		                        InvoiceTotal as [Orig Amt],
		                        TaxAmount as [Sales Tax],
		                        CurrentBalance as [Open Balance],
		                        DiscountAmount as [Discount Amt],
                                CP2.Value as [Discount Date]
	                        FROM InvoiceHistory IH
                            LEFT JOIN CustomProperty CP1 ON CP1.ParentId = IH.ID AND CP1.Name = 'JobName'
                            LEFT JOIN CustomProperty CP2 ON CP2.ParentId = IH.ID AND CP2.Name = 'DiscountDate'
	                        WHERE IH.ID IN ({0})";

            var invoiceListString = "";
            var invoiceCount = 0;
            foreach (var invoice in rqst.SelectedInvoices)
            {
                invoiceCount++;
                invoiceListString += "'" + invoice + "'";
                if (invoiceCount < rqst.SelectedInvoices.Length)
                {
                    invoiceListString += ", ";
                }
            }

            var sBuilder = new StringBuilder();
            using (var conn = new SqlConnection(ConnectionString))
            {
                conn.Open();
                var cmd = new SqlCommand(string.Format(sqlQuery, invoiceListString), conn);
                var dataReader = cmd.ExecuteReader();
                var firstRow = true;
                while (dataReader.Read())
                {
                    if (firstRow) // Print csv header
                    {
                        for (var i = 0; i < dataReader.FieldCount; i++)
                        {
                            sBuilder.Append(dataReader.GetName(i) + ",");
                        }
                        sBuilder.Append("Aging");
                        sBuilder.Append(Environment.NewLine);
                        firstRow = false;
                    }

                    var isOpen = (dataReader.GetValue(0).ToString().EqualsIgnoreCase("open"));
                    var dueDate = (DateTime)dataReader["Due Date"];
                    sBuilder.Append(dataReader.GetValue(0) + ",");
                    sBuilder.Append(dataReader.GetValue(1) + ",");
                    sBuilder.Append(dataReader.GetValue(2) + ",");
                    sBuilder.Append(dataReader.GetValue(3) + ",");
                    sBuilder.Append(dataReader.GetValue(4) + ",");
                    sBuilder.Append(Convert.ToDateTime(dataReader.GetValue(5)).ToString("MM/dd/yyyy") + ",");
                    sBuilder.Append(Convert.ToDateTime(dataReader.GetValue(6)).ToString("MM/dd/yyyy") + ",");
                    sBuilder.Append(string.Format(@"""{0:C}"",", Convert.ToDecimal(dataReader.GetValue(7))));
                    sBuilder.Append(string.Format(@"""{0:C}"",", Convert.ToDecimal(dataReader.GetValue(8))));
                    sBuilder.Append(string.Format(@"""{0:C}"",", Convert.ToDecimal(dataReader.GetValue(9))));
                    sBuilder.Append(string.Format(@"""{0:C}"",", Convert.ToDecimal(dataReader.GetValue(10))));
                    //this custom property represents a date, but is a string
                    sBuilder.Append(dataReader.GetValue(11) + ",");

                    var aging = !isOpen ? string.Empty
                            : dueDate > currentEnd? "Future"
                            : InDateRange(currentStart, currentEnd, dueDate) ? "Current"
                            : InDateRange(date31To60Start, date31To60End, dueDate) ? "30+"
                            : InDateRange(date61To90Start, date61To90End, dueDate) ? "60+"
                            : InDateRange(date91To120Start, date91To120End, dueDate)? "90+"
                            : "120+";
                    sBuilder.Append(aging);

                    sBuilder.Append(Environment.NewLine);
                }
            }

            var byteArray = Encoding.ASCII.GetBytes(sBuilder.ToString());
            return new MemoryStream(byteArray);
        }

    }
}
