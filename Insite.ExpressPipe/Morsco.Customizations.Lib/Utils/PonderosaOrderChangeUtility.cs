using System.IO;
using Insite.Common.Logging;

namespace Morsco.Customizations.Lib.Utils
{
    static class PonderosaOrderChangeUtility
    {
        /// <summary>
        /// 
        /// </summary>
        public static void CopyFileSSISPath(string tempFolder, string ssisPath)
        {
            string destFile;
            if (System.IO.Directory.Exists(tempFolder) && System.IO.Directory.Exists(ssisPath))
            {
                var dir = new DirectoryInfo(tempFolder);

                FileInfo[] files = dir.GetFiles();

                // Copy the files and overwrite destination files if they already exist.
                foreach (FileInfo sourceFile in files)
                {
                    // Use static Path methods to extract only the file name from the path.
                    //fileName = System.IO.Path.GetFileName(sourceFile);
                    if (sourceFile.Length > 0)
                    {
                        destFile = System.IO.Path.Combine(ssisPath, sourceFile.Name);
                        if (!File.Exists(destFile))
                        {
                            sourceFile.CopyTo(destFile, false);
                        }
                    }
                }

                foreach (FileInfo file in dir.GetFiles())
                {
                    destFile = System.IO.Path.Combine(ssisPath, file.Name);
                    if ((File.Exists(destFile) || file.Length <= 0) && !IsFileLocked(file))
                    {
                        file.Delete();
                    }
                    else if (!File.Exists(destFile))
                    {
                        LogHelper.ForType(typeof(PonderosaOrderChangeUtility))
                            .Info("File (" + destFile + ") was not found and could not be moved from web server location");
                    }
                    else if (IsFileLocked(file))
                    {
                        LogHelper.ForType(typeof(PonderosaOrderChangeUtility))
                            .Info("Ponderosa Order Update", "File (" + destFile + ") was locked and could not be moved from web server location");
                    }
                }
            }
        }

        /// <summary>
        /// This function is used to check specified file being used or not
        /// </summary>
        /// <param name="file">FileInfo of required file</param>
        /// <returns>If that specified file is being processed 
        /// or not found is return true</returns>
        private static bool IsFileLocked(FileInfo file)
        {
            FileStream stream = null;
            try
            {
                //Don't change FileAccess to ReadWrite, 
                //because if a file is in readOnly, it fails.
                stream = file.Open
                (
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.None
                );
            }
            catch (IOException)
            {
                return true;
            }
            finally
            {
                if (stream != null)

                    stream.Close();
            }
            //file is not locked
            return false;
        }
    }    
}
