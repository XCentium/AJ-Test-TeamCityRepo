using System;
using Insite.Common.Logging;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Repositories;

namespace Morsco.PonderosaService.Services
{
    public class ControlFileService: IDisposable
    {
        public ControlFileResponse GetControlFileValue(string controlId, string applicationSettingName)
        {
            ControlFileResponse controlValue;
            try
            {
                var repository = new ControlFileRepository();

                controlValue = repository.GetControlFile(controlId, applicationSettingName);

            }
            catch (Exception ex)
            {
                LogHelper.For(this).Error(ex.Message, GetType().ToString());
                throw;
            }

            return controlValue;
 
        }

        /// <summary>
        /// In case we have to clean up any resources
        /// </summary>
        public void Dispose()
        {
            //Deliberately blank
        }
        
    }
}
