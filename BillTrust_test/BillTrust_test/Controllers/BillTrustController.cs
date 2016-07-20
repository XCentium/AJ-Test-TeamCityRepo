using InSiteCommerce.Web.MorscoCustomizations.BillTrust;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace BillTrust_test.Controllers
{
    public class BillTrustController : Controller
    {
        private string devGuid = "2A3F9BC0-ACD4-C2E9-52A0-0000203C29FA";
        private string clientGuid = "2A3F9BC0-ACD4-C2E9-52A0-0000203C29FA";

        private string  getEnrolledAccountsListByDateRequestTemplate = @"<?xml version='1.0' encoding='UTF-8'?>
                        <Request id='{0}' type='GetEnrolledAccountListByDate'
                        clientGUID='{1}'>
                          <FromDate>{2}</FromDate>
                          <ToDate>{3}</ToDate>
                        </Request>";

        private string getEnrolledAccountPaperBillListByDateTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                                        <Request id='{0}' type='GetEnrolledAccountPaperBillListbyDate'
                                                                        clientGUID='{1}'>
                                                                          <FromDate>{2}</FromDate>
                                                                          <ToDate>{3}</ToDate>
                                                                        </Request> 
                                                                         ";

        private string getOnlinePaymentsListByDateTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                                <Request id='{0}' type='GetOnlinePaymentListByDate'
                                                                clientGUID='{1}'>
                                                                  <FromDate>{2}</FromDate>
                                                                  <ToDate>{3}</ToDate>
                                                                </Request>";


        private string getAccountDetailByAccountNumberTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                                    <Request id='{0}' type='GetAccountDetailByAccountNumber'
                                                                    clientGUID='{1}'>
                                                                      <AccountNumber>{2}</AccountNumber>
                                                                    </Request> 
                                                                     ";

        private string getPaymentDetailsTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                        <Request id='{0}' type='GetPaymentDetails'
                                                        clientGUID='{1}'>
                                                          <AccountNumber>{2}</AccountNumber>
                                                          <StartDate>{3}</StartDate>
                                                          <EndDate>{4}</EndDate>
                                                        </Request>";


        private string getAccountDetailsTemplate = @"<?xml version='1.0' encoding='utf-8'?>
                                                    <Request id='{0}' type='GetAccountDetailByAccountNumber'
                                                    clientGUID='{1}'>
                                                      <AccountNumber>{2}</AccountNumber>
                                                    </Request>";
        // GET: BillTrust
        public ActionResult Index(int functionNumber, string account)
        {

            var url = "https://webservice.billtrust.com/xmlwebservices/webservicedispatch.php";
            string xmlRequest = string.Empty;

            switch(functionNumber)
            {
                case 1:
                    xmlRequest = string.Format(getEnrolledAccountsListByDateRequestTemplate, devGuid, clientGuid, DateTime.Now.AddDays(-90).ToString("yyyy-MM-dd"), DateTime.Now.ToString("yyyy-MM-dd"));
                    break;

                case 2:
                    xmlRequest = string.Format(getEnrolledAccountPaperBillListByDateTemplate, devGuid, clientGuid, DateTime.Now.AddDays(-90).ToString("yyyy-MM-dd"), DateTime.Now.ToString("yyyy-MM-dd"));
                    break;

                case 3:
                    xmlRequest = string.Format(getOnlinePaymentsListByDateTemplate, devGuid, clientGuid, DateTime.Now.AddDays(-90).ToString("yyyy-MM-dd"), DateTime.Now.ToString("yyyy-MM-dd"));
                    break;

                case 4:
                    xmlRequest = string.Format(getAccountDetailByAccountNumberTemplate, devGuid, devGuid, "76627");
                    break;

                case 5:
                    xmlRequest = string.Format(getPaymentDetailsTemplate, devGuid, clientGuid, "76627", DateTime.Now.AddDays(-720).ToString("yyyy-MM-dd"), DateTime.Now.ToString("yyyy-MM-dd"));
                    break;

                case 6:
                    xmlRequest = string.Format(getAccountDetailsTemplate, devGuid, clientGuid, account);
                    break;
            }

            var resp = postXMLData(url, xmlRequest);
            ////var sampleResponse = @"<?xml version='1.0' encoding='utf-8'?>
            //            <Response id='2A3F9BC0-ACD4-C2E9-52A0-0000203C29FA' errorCode='0' errorMessage=''>
            //              <Accounts>
            //                <Account accountNumber='103213' status='A' enrollmentDate='2006-01-01' emailAddress='abc123@domain.com'/>
            //                <Account accountNumber='134368' status='C' enrollmentDate='2006-01-01' emailAddress='def456@domain.com'/>
            //              </Accounts>
            //            </Response> ";

            ViewBag.resp = resp;
            return View();
        }

        public ActionResult TestBillTrust()
        {
            var list = new List<string>();
            list.Add("S5586703");
            //list.Add("S5586703.001");


            var invoiceUrl = BillTrustHelper.GetInvoices(BillTrustEnvironment.Production, "17895", list);

            //var url = BillTrustHelper.GenerateSSOUrl(BillTrustEnvironment.Production, "76627", "test@test.com", "test", false, false, false);
            //ViewBag.SSOUrl = url;
            Response.Redirect(invoiceUrl);
            return View();

        }

        public string postXMLData(string destinationUrl, string requestXml)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(destinationUrl);
            byte[] bytes;
            bytes = System.Text.Encoding.ASCII.GetBytes(requestXml);
            request.ContentType = "text/xml; encoding='utf-8'";
            request.ContentLength = bytes.Length;
            request.Method = "POST";
            Stream requestStream = request.GetRequestStream();
            requestStream.Write(bytes, 0, bytes.Length);
            requestStream.Close();
            HttpWebResponse response;
            response = (HttpWebResponse)request.GetResponse();
            if (response.StatusCode == HttpStatusCode.OK)
            {
                Stream responseStream = response.GetResponseStream();
                string responseStr = new StreamReader(responseStream).ReadToEnd();
                return responseStr;
            }
            return null;
        }
    }
}