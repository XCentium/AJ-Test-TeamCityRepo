using System;
using System.Threading;
using Insite.Common.Logging;
using Morsco.PonderosaService.Common;
using Ponderosa.Config;
using Ponderosa.U2mv;

namespace Morsco.PonderosaService.Services
{
    /// <summary>
    /// Initializes the Ponderosa Connection Pool which should be done only once.
    /// Performs the logging.
    /// </summary>
    public static class PonderosaService
    {
        private static DateTime _waitToResetTil = DateTime.MinValue;
        private static readonly TimeSpan ResetTimeSpan = TimeSpan.FromSeconds(Utility.GetConfigValueWithDefault<int>("Morsco.Ponderosa.SecondsBetweenResets", 30));
        private static readonly object SynchRoot = string.Empty;

        public static string GetConfigSectionName()
        {
            var wrapper = new ConfigurationWrapper("TestOp");
            wrapper.SetElement(new string[] {"config"});
            return wrapper.GetStr("runConfig", "dev.config");
        }

        public static void InitializeConnectionPool()
        {
            try
            {
                lock (SynchRoot)
                {
 
                    if (DateTime.Now > _waitToResetTil)
                    {
                        PerformInitialization();
                        
                        _waitToResetTil = DateTime.Now + ResetTimeSpan;

                        LogHelper.ForType(typeof(PonderosaService)).Info(
                            $"Thread {Thread.CurrentThread.Name} initialized with config section = {GetConfigSectionName()}.  Now={DateTime.Now}, WaitTil={_waitToResetTil}");
                    }
                    else
                    {
                        LogHelper.ForType(typeof(PonderosaService)).Info(
                            $"Thread {Thread.CurrentThread.Name} Skipping Initialization.  Now={DateTime.Now}, WaitTil={_waitToResetTil}");
                    }
                }
            }
            catch (Exception ex)
            {
                LogHelper.ForType(typeof(PonderosaService)).Error(
                    $"Thread {Thread.CurrentThread.Name}, Exception for config section = {GetConfigSectionName()}: {ex.Message}");
                throw;
            }
        }

        public static void PerformInitialization()
        {
            ConnectionPool.Close();
			var name = GetConfigSectionName();
            ConnectionPool.Init(GetConfigSectionName());
        }

        public static void DisposeConnectionPool()
        {
            ConnectionPool.Close();
        }
    }
}
