using System;
using System.Collections.Generic;
using System.Configuration;
using Insite.Core.Context;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Entities;
using Morsco.PonderosaService.Mappers;
using Morsco.PonderosaService.Services;
using Ponderosa.U2mv;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Repositories
{
    public class CreditCardRepository : BasePonderosaRepository
    {
		private static int _contactId;

        public List<CreditCardEntity> GetCreditCardList(int contactId, string customerId)
		{
			var contactRepository = new ContactServices();
			var creditCardList = new List<CreditCardEntity>();
			var contact = contactRepository.GetContact(contactId);
			var cc = contact.GetSubTable(CreditCardConstants.CreditCardList);

		    if (cc != null)
		    {
		        while (cc.HasNext())
		        {
		            var rowResult = cc.GetRowResult();
		            var expDate = rowResult.GetString(CreditCardConstants.ExpireDate);
		            var month = Convert.ToInt32(expDate.Substring(0, 2));
		            var year = 2000 + Convert.ToInt32(expDate.Substring(2, 2));
		            var expirationDate = new DateTime(year, month, 1).AddMonths(1).AddMilliseconds(-3);

		            if (expirationDate < DateTime.Now)
		            {
		                var deleteResult = DeleteCreditCard(cc.ResultData());
		            }
		            else
		            {
		                creditCardList.Add(RowResultToDtoMapper.Map<CreditCardEntity>(rowResult));
		            }
		        }
		    }
		    return creditCardList;
		}

		public List<CreditCardEntity> DeleteCardFromContact(int contactId, string elementAccountId)
		{
			var contactRepository = new ContactServices();
			var creditCardList = new List<CreditCardEntity>();
			var contact = contactRepository.GetContact(contactId);
			_contactId = contactId;
			
			if (contact != null)
			{
				var cc = contact.GetSubTable(CreditCardConstants.CreditCardList);
				while (cc.HasNext())
				{
					var rowResult = cc.GetRowResult();
					if (rowResult.GetString(CreditCardConstants.ElementAcctID) == elementAccountId)
					{
						var deleteResult = DeleteCreditCard(cc.ResultData());
					}
					else
					{
						creditCardList.Add(RowResultToDtoMapper.Map<CreditCardEntity>(rowResult));
					}
				}
			}

			return creditCardList;
		}

		private Boolean DeleteCreditCard(IDictionary<string, object> ccBlock)
	    {
			var contact = new Dictionary<string, object>();
			ccBlock[CreditCardConstants.Delete] = true;
			contact[CreditCardConstants.CreditCard] = ccBlock;
			SubmitCc(contact);

		    return true;
	    }


		public Dictionary<string, object> InitiateAddNewCreditCard(string origin, IDictionary<string, object> user)
		{
			var contactServices = new ContactServices();
			var contactId = Convert.ToInt32(user["Contact_ID"]);

			RowResult contact = null;
			contact = contactServices.GetContact(contactId);

			if (contact == null)
			{
				contactId = contactServices.AddContact(user);
			}

			user[CreditCardConstants.ContactID] = contactId;
			user[CreditCardConstants.ReturnURL] = ConfigurationManager.AppSettings["CreditCardReturnUrl"];

            var returnResult = new Dictionary<string, object>();
            try
            {
                var setupResult = base.SendUpload(ContactConstants.SetupElementAccount, user);
                returnResult[CreditCardConstants.Success] = true;
                returnResult[CreditCardConstants.RedirectURL] = setupResult.GetString(CreditCardConstants.RedirectURL);
            }
            catch (Exception ex)
            {
                returnResult[CreditCardConstants.Success] = false;
                returnResult["ErrorMessage"] = ex.Message;
            }

			return returnResult;
		}

		public string FinalizeNewCreditCard(Dictionary<string, object> setupResult, string billToId)
		{
			_contactId = (int)setupResult[CreditCardConstants.ContactID];
			var ccResult = base.SendUpload(ContactConstants.ElementAccount, setupResult);
			var ccBlock = ccResult.ResultData();
			var contact = new Dictionary<string, object>();
			
			contact[CreditCardConstants.CreditCard] = ccBlock;
			SubmitCc(contact);

			return ccBlock[CreditCardConstants.ElementAcctID].ToString();
		}

		public DataResult SubmitCc(IDictionary<string, object> contact)
		{
			contact[CreditCardConstants.ContactID] = _contactId;
			contact[CreditCardConstants.ChangedBy] = CreditCardConstants.Website;  // User ID for Eclipse change log
			ResponseResult result;
		    Connection conn = null;
		    try
		    {
		        conn = ConnectionPool.GetConnection();
		        result = conn.UploadRow(CreditCardConstants.SubmitContactCc, contact);
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
