using System;
using System.Data;
using Morsco.IntegrationProcessor.Helper;
using Morsco.IntegrationProcessor.Repositories;
using System.Configuration;
using Insite.Integration.Enums;
using Insite.WIS.Broker;
using Insite.WIS.Broker.Interfaces;
using Insite.WIS.Broker.WebIntegrationService;
using Morsco.PonderosaService.Services;

namespace Morsco.IntegrationProcessor
{
    /*
     * This method process the web order as soon as it gets submitted and get data to send it to Eclipse for backend ERP processing
     * It calls Ponderosa Order Service to send the web order data and get the ERPOrderNumber and Status after successful submission
     * and the same gets updated back in the Insite database order table
     */
    public class IntegrationProcessReadEclipseControlFiles : IIntegrationProcessor
    {
        public DataSet Execute(SiteConnection siteConnection, IntegrationJob integrationJob,
        JobDefinitionStep integrationJobStep)
        {
            var dataSet = new DataSet();
            var userName = "ControlFileProcessor";

            //make sure the initial dataset is at least usable.
            
            var mySetting = ConfigurationManager.ConnectionStrings[Constants.InsiteCommerce];
            Log(siteConnection, integrationJob, IntegrationJobLogType.Info, "ConnectionString: " + mySetting.ConnectionString);

            try
            {
                //PonderosaService.PerformInitialization();
                Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                    "Initialized Ponderosa with configurationSection " + PonderosaService.Services.PonderosaService.GetConfigSectionName());
            }
            catch
            {
                Log(siteConnection, integrationJob, IntegrationJobLogType.Error,
                    "Failed to initialize Ponderosa with configurationSection " + PonderosaService.Services.PonderosaService.GetConfigSectionName());
                throw;
            }

            var repository = new DataRepository();

            try
            {
                var eclipseControlFileData = repository.GetEclipseControlFileData();
                Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                    "Read the control file list from the database.");

                if (eclipseControlFileData?.Rows != null && eclipseControlFileData.Rows.Count > 0)
                {
                    using (var svc = new ControlFileService())
                    {
                        foreach (DataRow controlFile in eclipseControlFileData.Rows)
                        {
                            var controlId = controlFile[Constants.EclipseControlId].ToString();
                            var appSettingName = controlFile[Constants.ApplicationSettingName].ToString();
                            Log(siteConnection, integrationJob, IntegrationJobLogType.Info, "Reading the control Id & Value from Eclipse source.");
                            var fileValue = svc.GetControlFileValue(controlId, appSettingName);

                            Log(siteConnection, integrationJob, IntegrationJobLogType.Info, "Retrieved the control Id & Value from Eclipse source.");
                            if (fileValue != null)
                            {
                                bool updated = repository.UpsertApplicationSetting(appSettingName, fileValue.ApplicationSettingValue, userName);
                                Log(siteConnection, integrationJob, IntegrationJobLogType.Info,
                                    "Updated the Applicationsettings value in to Insite database.");
                                if (!updated)
                                {
                                    Log(siteConnection, integrationJob, IntegrationJobLogType.Error, "Eclipse Control File for: " + appSettingName + " not updated. ");
                                }
                            }
                        }
                    }
                }
                else
                {
                    Log(siteConnection, integrationJob, IntegrationJobLogType.Error, "Not able to read the Eclipse Control File Data from the database.");
                }
            }
            catch (Exception ex)
            {
                    Log(siteConnection, integrationJob, IntegrationJobLogType.Error, "Not able to read/write the Eclipse Control File Data in/out the database. " + ex.InnerException);  
            }
            return dataSet;
        }

        private void Log(SiteConnection siteConnection, IntegrationJob integrationJob, IntegrationJobLogType logType, string message)
        {
            siteConnection.AddLogMessage(
                integrationJob.Id.ToString(),
                logType,
                message);
        }
    } 
}

