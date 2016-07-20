using System.Data;
using System.Text;

namespace Morsco.Customizations.Lib.Utils
{
    public class Converter
    {
        public static string DataTableToJson(DataTable dt)
        {
            DataSet ds = new DataSet();
            ds.Merge(dt);
            StringBuilder JsonStr = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                JsonStr.Append("[");
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    JsonStr.Append("{");
                    for (int j = 0; j < ds.Tables[0].Columns.Count; j++)
                    {
                        if (j < ds.Tables[0].Columns.Count - 1)
                        {
                            JsonStr.Append("\"" + ds.Tables[0].Columns[j].ColumnName + "\":" + "\"" + ds.Tables[0].Rows[i][j] + "\",");
                        }
                        else if (j == ds.Tables[0].Columns.Count - 1)
                        {
                            JsonStr.Append("\"" + ds.Tables[0].Columns[j].ColumnName + "\":" + "\"" + ds.Tables[0].Rows[i][j] + "\"");
                        }
                    }
                    if (i == ds.Tables[0].Rows.Count - 1)
                    {
                        JsonStr.Append("}");

                    }
                    else
                    {
                        JsonStr.Append("},");
                    }
                }
                JsonStr.Append("]");
                return JsonStr.ToString();
            }
            else
            {
                return null;
            }
        }
    }
}
