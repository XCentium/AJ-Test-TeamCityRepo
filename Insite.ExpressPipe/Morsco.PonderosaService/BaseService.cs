using Ponderosa.Config;
using Ponderosa.U2mv;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Insite.ExpressPipe.PonderosaService
{
    public abstract class BaseService : IDisposable
    {
        protected static bool ConnectionPoolInitialized { get; set; }

        protected BaseService()
        {
            //TODO: Seems like we have to initialize connection pool on each use of service
            if (true || !ConnectionPoolInitialized)
            {
                ConfigurationWrapper wrapper = new ConfigurationWrapper("TestOp");
                wrapper.SetElement(new string[] { "config" });
                var configSectionName = wrapper.GetStr("runConfig", "dev.config");
                ConnectionPool.Init(configSectionName);
                ConnectionPoolInitialized = true;
            }
        }

        public void Dispose()
        {
            ConnectionPool.Close();
        }
    }
}
