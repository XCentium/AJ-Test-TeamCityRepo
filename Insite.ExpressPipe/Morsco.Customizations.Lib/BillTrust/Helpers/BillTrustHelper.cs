using Insite.Core.Context;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
namespace Morsco.Customizations.Lib.BillTrust.Helpers
{
    public class BillTrustHelper
    {
        /// <summary>
        /// Generates a URL for signing into BillTrust
        /// </summary>
        /// <param name="environment">The environment your would like to generate a URL for. Either Production or Test</param>
        /// <param name="accountNumber">This is the Account numbers recognized by Billtrust</param>
        /// <param name="email">This field is required for initial enrollment.  Depending on how you choose to set up SSO, Billtrust will use either the email address contained in the query string or the email address your customer defines within the Billtrust site.   </param>
        /// <param name="userName">This is the user name of the user that will be logging into the system. This is an optional attribute for Invoice Gateway only and will be used to setup the user if they are currently not setup yet for the account. The first person to log into the system will be setup as the administrator, and any subsequent users will be setup with non-admin privileges. The privileges will default to allow the customer to download </param>
        /// <param name="receivePaperBill">This field provides your preference for the sending of a paper bill to the end user.  If set to True a paper bill will continue to be sent (assuming the user was currently getting a paper bill) to the end user after enrollment in Invoice Gateway or Online Billing.  Note that if your customer was getting their bill by email or fax, they would continue to receive their bill through this method and the “PB” attribute will be ignored.  You can allow your customers to opt in or out of receiving a paper bill within the “Options” tab of Invoice Gateway or Online Billing. After the initial enrollment, you can set up SSO so that Billtrust will use this preference to override the preference set in the query string.   Conversely, you can eliminate the option that lets your customer control their “paper” preference within Invoice Gateway or Online Billing.  In this case, Billtrust will continue to pull the preference from the “PB” setting.</param>
        /// <param name="ebillNotification">Send the use email notifications when a new bill is posted to their account</param>
        /// <param name="emailACHConfirmation">This field is for Online Billing customers only. Setting is either a “Y” or “N”.  This is an indicator to send an ACH/CC Email Notification to the end user when a payment is initiated for settlement.</param>
        /// <returns></returns>
        public static string GenerateSSOUrl(string accountNumber, string email, string userName)
        {

            var env = ConfigurationManager.AppSettings["BillTrust_Environment"];
            BillTrustEnvironment environment = (env.ToLower() == "production") ? BillTrustEnvironment.Production : BillTrustEnvironment.Test;

			//When BilltrustSSO is re-enabled, than this is the code thats used to generate the SSO URL.

			//bool receivePaperBill = false;
			//bool ebillNotification = false;
			//bool emailACHConfirmation = false;
			//bool.TryParse(ConfigurationManager.AppSettings["BillTrust_ReceivePaperBill"], out receivePaperBill);
			//bool.TryParse(ConfigurationManager.AppSettings["BillTrust_EbillNotification"], out ebillNotification);
			//bool.TryParse(ConfigurationManager.AppSettings["BillTrust_EmailACHConfirmation"], out emailACHConfirmation);

			//var BaseTestUrl = ConfigurationManager.AppSettings["BillTrust_SSOTestUrl"];
			//var BaseProductionUrl = ConfigurationManager.AppSettings["BillTrust_SSOProductionUrl"];

			//var bnDataTemplate = ConfigurationManager.AppSettings["BillTrust_DataTemplate"];

			//var integrationGuid = "&CG=" + ConfigurationManager.AppSettings["BillTrust_DeveloperGuid"];
			//var encryptionKey = ConfigurationManager.AppSettings["BillTrust_EncryptionKey"];


			//var retUrl = BaseTestUrl;
			//if (environment == BillTrustEnvironment.Production)
			//{
			//    retUrl = BaseProductionUrl;
			//}

			//var bnData = string.Format(bnDataTemplate, accountNumber, email, (receivePaperBill ? "Y" : "N"), (ebillNotification ? "Y" : "N"), (emailACHConfirmation ? "Y" : "N"), userName + "-" + accountNumber, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

			//if (environment == BillTrustEnvironment.Production)
			//{
			//    retUrl += Encrypt(bnData, false, encryptionKey) + integrationGuid + "&ETYPE=1";
			//}
			//else
			//{
			//    retUrl += bnData + integrationGuid + "&ETYPE=0";
			//}

			//return retUrl;



			//When BillTrust SSO is enabled, this code should be removed.
			return env.EqualsIgnoreCase("production") ? ConfigurationManager.AppSettings["BillTrust_TempInvoiceProductionUrl"] : ConfigurationManager.AppSettings["BillTrust_TempInvoiceTestUrl"];
        }

        public static string GetInvoices(string accountNumber, List<string> invoiceNumbers)
        {
			//Prevent access to invoices from users with role Buyer 2
			var hasRole = SiteContext.Current.IsUserInRole("Buyer2");
			if (hasRole)
			{
				return null;
			}

			var env = ConfigurationManager.AppSettings["BillTrust_Environment"];
            BillTrustEnvironment environment = (env.ToLower() == "production") ? BillTrustEnvironment.Production : BillTrustEnvironment.Test;

            var BaseTestUrl = ConfigurationManager.AppSettings["BillTrust_InvoiceTestUrl"];
            var BaseProductionUrl = ConfigurationManager.AppSettings["BillTrust_InvoiceProductionUrl"];
            var devGuid = ConfigurationManager.AppSettings["BillTrust_DeveloperGuid"];

            var url = BaseProductionUrl;
            if (environment == BillTrustEnvironment.Test)
            {
                url = BaseTestUrl;
            }

            url += "?custnbr=" + devGuid + "&p=";

            var encryptionKey = ConfigurationManager.AppSettings["BillTrust_EncryptionKey"];
            var toEncrypt = "custnbr=" + ConfigurationManager.AppSettings["BillTrust_ClientGuid"] + "&method=getMyBills&acctnumber=" + accountNumber;

            var invoiceNumberString = string.Empty;
            int cnt = 0;

            foreach (string inv in invoiceNumbers)
            {
                invoiceNumberString += "&invoice" + cnt++ + "=" + inv;
            }

            var encryptedString = Encrypt(toEncrypt + invoiceNumberString, false, encryptionKey);

            url += encryptedString;
            return url;

            //  In case we ever need to return a stream
            //var req = (HttpWebRequest)WebRequest.Create(url);
            //var response = req.GetResponse();
            ////check the filetype returned
            //var contentType = response.ContentType;

            //var fileType = string.Empty;

            //if (contentType != null)
            //{
            //    var splitString = contentType.Split(';');
            //    fileType = splitString[0];
            //}

            //Stream stream = response.GetResponseStream();
            //response.Close();

            ////see if its PDF
            //if (fileType != null && fileType == "application/pdf")
            //{
            //    return stream;
            //}
            //else
            //{
            //    throw new Exception("An error occurred retrieving the invoice. Most likely cause is the invoice does not exist.");
            //}
        }

        private static void getAccountDetailByAccountNumber(string url, string devGuid, string accountNumber)
        {
            var xmlRequest = string.Empty;
            string getAccountDetailByAccountNumberTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                                    <Request id='{0}' type='GetAccountDetailByAccountNumber'
                                                                    clientGUID='{1}'>
                                                                      <AccountNumber>{2}</AccountNumber>
                                                                    </Request> 
                                                                     ";

            xmlRequest = string.Format(getAccountDetailByAccountNumberTemplate, devGuid, devGuid, accountNumber);

            //var resp = postXMLData(url, xmlRequest);
            return;
        }

        public static bool CheckValidUrl(string destinationUrl)
        {
            WebRequest request = WebRequest.Create(destinationUrl);
            try
            {
                using (WebResponse response = request.GetResponse())
                {
                    if (response.ContentType == "application/pdf")
                    {
                        return true;
                    }
                    
                }
            }
            catch (WebException e)
            {
                using (WebResponse response = e.Response)
                {
                    HttpWebResponse httpResponse = (HttpWebResponse)response;
                    Console.WriteLine("Error code: {0}", httpResponse.StatusCode);
                    using (Stream data = response.GetResponseStream())
                    using (var reader = new StreamReader(data))
                    {
                        string text = reader.ReadToEnd();
                    }
                }
            }

            return false;
        }

        private static string Encrypt(string toEncrypt, bool useHashing, string key)
        {
            byte[] keyArray;
            byte[] keyVector;
            byte[] toEncryptArray = UTF8Encoding.UTF8.GetBytes(toEncrypt);

            if (useHashing)
            {
                MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider();
                keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                keyVector = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key.ToCharArray(), 0, 4));
                hashmd5.Clear();
            }
            else
            {
                keyArray = UTF8Encoding.UTF8.GetBytes(key);
                keyVector = UTF8Encoding.UTF8.GetBytes(key.Substring(0, 8));
            }

            TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider();
            tdes.Key = keyArray;
            tdes.IV = keyVector;
            tdes.Mode = CipherMode.CBC;
            tdes.Padding = PaddingMode.Zeros;
            ICryptoTransform cTransform = tdes.CreateEncryptor();

            byte[] resultArray;
            using (MemoryStream msEncrypt = new MemoryStream())
            {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, cTransform, CryptoStreamMode.Write))
                {
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(toEncrypt);
                    }
                    resultArray = msEncrypt.ToArray();
                }
            }
            tdes.Clear();
            return Convert.ToBase64String(resultArray, 0, resultArray.Length);
        }
    }

    public enum BillTrustEnvironment
    {
        Test, Production
    }
}