using System.Xml.Serialization;
using System.Data;
using System.IO;

namespace Morsco.IntegrationProcessor.UnitTest
{
    class TestHelper
    {
        #region Integration Processor UnitTesting


        public static DataSet GetSerializedDataSet()
        {
            DataSet ds = new DataSet();
            XmlSerializer xmlSerializer = new XmlSerializer(typeof(DataSet));
            FileStream readStream = new FileStream("C:\\XMLs\\ExpressPipeConnection_OrderSubmit_67_20151013_134006.xml", FileMode.Open);
            ds = (DataSet)xmlSerializer.Deserialize(readStream);
            readStream.Close();
            return ds;
        }
        #endregion
    }
}
