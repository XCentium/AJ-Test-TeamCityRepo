using System.Collections.Generic;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;
using Ponderosa.U2mv;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Repositories
{
    public class ControlFileRepository
    {
        public ControlFileResponse GetControlFile(string ControlId, string ApplicationSettingName)
        {
            Connection connection = null;
            var result = new ControlFileResponse();
            var request = new Dictionary<string, object>();
            request[ControlFileConstants.ControlId] = ControlId;

            try
            {
                connection = ConnectionPool.GetConnection();
                var response = connection.RequestResponse(ControlFileConstants.TransferClass, request);
                result = MapControlFileResult(response, ControlId);
            }
            finally 
            {
                if (connection != null)
                {
                    connection.Close();
                }
            }
            return result;
        }

        private ControlFileResponse MapControlFileResult(ResponseResult result, string ControlId)
        {
            var returnVal = new ControlFileResponse();
            var seperator = " , ";
            returnVal.ControlId = ControlId;
            returnVal.ApplicationSettingValue = result.IsList(ControlId) ? string.Join(seperator, result.GetArray(ControlId)) : result.GetValue(ControlId).ToString();
            return returnVal;
        }
    }
}
