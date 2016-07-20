using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Morsco.IntegrationProcessor.Repositories;
using Morsco.IntegrationProcessor.Helper;
using System.Data;
using Morsco.PonderosaService.Services;

namespace Morsco.IntegrationProcessor.UnitTest
{
    [TestClass]
    public class ControlFileTest
    {
        [TestMethod]
        public void TestEclipseControlFile()
        {
            string userName = "ControlFileProcessor_UnitTest";
            bool testSuccess = true;
            try
            {
                var repository = new DataRepository();

                var eclipseControlFileData = repository.GetEclipseControlFileData();

                if (eclipseControlFileData?.Rows != null && eclipseControlFileData.Rows.Count > 0)
                {
                    using (var svc = new ControlFileService())
                    {
                        foreach (DataRow controlFile in eclipseControlFileData.Rows)
                        {
                            var controlId = controlFile[Constants.EclipseControlId].ToString();
                            PonderosaService.Services.PonderosaService.PerformInitialization();

                            var appSettingName = controlFile[Constants.ApplicationSettingName].ToString();
                            var fileValue = svc.GetControlFileValue(controlId, appSettingName);

                            if (fileValue != null)
                            {
                                bool updated = repository.UpsertApplicationSetting(appSettingName, fileValue.ApplicationSettingValue, userName);
                                testSuccess = updated;
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                testSuccess = false;
            }
            Assert.IsTrue(testSuccess, "Failed to update CustomerOrder table with ERP Details");
        }
    }
}
