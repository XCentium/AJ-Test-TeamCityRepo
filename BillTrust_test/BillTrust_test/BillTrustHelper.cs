using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace InSiteCommerce.Web.MorscoCustomizations.BillTrust
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
        public static string GenerateSSOUrl(BillTrustEnvironment environment, string accountNumber, string email, string userName, bool receivePaperBill, bool ebillNotification, bool emailACHConfirmation)
        {
            var BaseTestUrl = "http://imweb.billtrust.com/SingleSignOn.php?BTDATA=";
            var BaseProductionUrl = "https://secure.billtrust.com/SingleSignOn.php?BTDATA=";
            var bnDataTemplate = "\"AN={0};EA={1};PB={2};EN={3};EC={4};UN={5};TS={6}\"";

            var integrationGuid = "&CG=" + ConfigurationManager.AppSettings["BillTrust_DeveloperGuid"].ToString();
            var encryptionKey = ConfigurationManager.AppSettings["BillTrust_EncryptionKey"].ToString();


            var retUrl = BaseTestUrl;
            if (environment == BillTrustEnvironment.Production)
            {
                retUrl = BaseProductionUrl;
            }

            var bnData = string.Format(bnDataTemplate, accountNumber, email, (receivePaperBill ? "Y" : "N"), (ebillNotification ? "Y" : "N"), (emailACHConfirmation ? "Y" : "N"), userName, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

            if (environment == BillTrustEnvironment.Production)
            {
                retUrl += Encrypt(bnData, false, encryptionKey) + integrationGuid + "&ETYPE=1";
            }
            else
            {
                retUrl += bnData + integrationGuid + "&ETYPE=0";
            }

            return retUrl;
        }

        public static string GetInvoices(BillTrustEnvironment environment, string accountNumber, List<string> invoiceNumbers)
        {
            var BaseTestUrl = "https://secure.billtrust.com/xmlwebservices/webServiceDispatch.php";
            var BaseProductionUrl = "https://secure.billtrust.com/xmlwebservices/webServiceDispatch.php";

            var url = BaseProductionUrl;
            if (environment == BillTrustEnvironment.Test)
            {
                url = BaseTestUrl;
            }

            url += "?custnbr=2A3F9BC0-ACD4-C2E9-52A0-0000203C29FA&p=";


            var encryptionKey = "CA859FF328392972508E8F84";
            var toEncrypt = "custnbr=2A3F9BC0-ACD4-C2E9-52A0-0000203C29FA&method=getMyBills&acctnumber=" + accountNumber;

            var invoiceNumberString = string.Empty;
            int cnt = 0;

            foreach (string inv in invoiceNumbers)
            {
                invoiceNumberString += "&invoice" + cnt++.ToString() + "=" + inv;
            }

            var encryptedString = Encrypt(toEncrypt += invoiceNumberString, false, encryptionKey);

            url += encryptedString;

            return url;

        }


        private static string Encrypt(string toEncrypt, bool useHashing, string key)
        {
            byte[] keyArray;
            byte[] toEncryptArray = UTF8Encoding.UTF8.GetBytes(toEncrypt);

            if (useHashing)
            {
                MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider();
                keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                hashmd5.Clear();
            }
            else
                keyArray = UTF8Encoding.UTF8.GetBytes(key);
            TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider();
            tdes.Key = keyArray;
            tdes.Mode = CipherMode.CBC;
            tdes.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = tdes.CreateEncryptor();
            byte[] resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
            tdes.Clear();
            return Convert.ToBase64String(resultArray, 0, resultArray.Length);
        }

    }

    public enum BillTrustEnvironment
    {
        Test, Production
    }
}