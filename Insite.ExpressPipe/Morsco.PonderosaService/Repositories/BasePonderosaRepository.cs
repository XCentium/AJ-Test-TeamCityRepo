using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using Insite.Common.Logging;
using Morsco.PonderosaService.Common;
using Ponderosa.U2mv;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Repositories
{
    public class BasePonderosaRepository
    {
        private static int _threadId = 0;
        private static readonly string SynchRoot = string.Empty;
        readonly string[] _messages = Utility.GetConfigValueWithDefault("Morsco.Ponderosa.ExceptionMessagesToReinit", "").Split(',');
        readonly int _maxAttempts = Utility.GetConfigValueWithDefault<int>("Morsco.Ponderosa.MethodAttempts", 2);

        private string GetProcessId()
        {
            var result = "0";
            lock (SynchRoot)
            {
                result = _threadId.ToString();
                _threadId++;
            }
            return result;
        }

        public T RunWithRetry<T>(string methodName, object[] parameters)
        {
            var attempts = 0;
            object result = null;
            MethodInfo methodInfo = null;

            //Assign a thread name if needed, so that we can distinguish among threads in log.
            if (string.IsNullOrEmpty(Thread.CurrentThread.Name))
            {
                Thread.CurrentThread.Name = GetProcessId();
            }

            while (attempts < _maxAttempts)
            {
                try
                {
                    methodInfo = GetType().GetMethod(methodName);
                    result = methodInfo.Invoke(this, parameters);
                    break;
                }
                catch (Exception ex)
                {
                    // Exceptions might be packaged in an invocation exception
                    if (ex is TargetInvocationException ||
                        ex.InnerException != null && ex.InnerException is ConnectionFault)
                    {
                        ex = ex.InnerException;
                    }

                    // Log the error in detail
                    LogException(methodName, "{0} in call with parameters as follows: {1} Exception Message: {2} {3}StackTrace: {4}", ex.GetType().Name,
                        Utility.GetParameterString(methodInfo, parameters), ex.Message, Environment.NewLine, ex.StackTrace);

                    // Give it another try, or bail if we've done that.
                    attempts++;
                    LogInfo(methodName, "Thread {0} On Attempt{1}", Thread.CurrentThread.Name, attempts);
                    if (attempts >= _maxAttempts)
                    {
                        LogInfo(methodName, "Thread {0} Throwing exception", Thread.CurrentThread.Name);
                        throw;
                    }

                    // Reset the connection pool if it makes sense to
                    if (ex is ConnectionFault && Utility.StringStartsWithListMember(ex.Message, _messages))
                    {
                        Services.PonderosaService.InitializeConnectionPool();
                    }
                }
            }
            return (T)result;
        }

        internal void LogInfo(string methodName, string format, params object[]  values)
        {
            LogHelper.For(this).Info(string.Format(format, values), GetType().FullName + "." + methodName);
        }

        internal void LogException(string methodName, string format, params object[] values)
        {
            //Strange way to make sure we can log in the 2 different environments (Web and Wis -- where WIS doesn't have Unity
            //and therefore cannot use ApplicationLog
            var location = GetType().FullName + "." + methodName;
            var errorMessage = string.Format(format, values);
            try
            {
                LogHelper.For(this).Error(errorMessage, location);
            }
            //throw the message as an exception if we can't log this way -- then the WIS log will pick it up.
            catch (Exception)
            {
                throw new Exception(string.Format("Error at {0}.  Message: {1}", location, errorMessage));
            }
        }

		internal DataResult SendUpload(string transferClass, IDictionary<string, object> hash)
		{
			ResponseResult result;
		    Connection conn = null;
		    try
		    {
		        conn = ConnectionPool.GetConnection();
		        result = conn.UploadRow(transferClass, hash);
		    }
		    finally
		    {
		        if (conn != null)
		        {
		            conn.Close();
		        }
		    }
			return result;
		}

    }
}
