using System.Collections.Generic;
using Morsco.PonderosaService.Constants;
using Ponderosa.U2mv;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Repositories
{
    public class ContactRepository: BasePonderosaRepository
    {
		public int AddContact(IDictionary<string, object> contact)
		{
			var result = SendUpload(ContactConstants.AddContact, contact);
			var contactId = result.GetInt(ContactConstants.ContactID);

			return contactId;
		}

        public int GetContactId(string login, string password)
        {
            var row = LoginContact(login, password);
            return (row != null && row.FieldNames().Contains(ContactConstants.ContactID)) ? row.GetInt(ContactConstants.ContactID) : 0;
        }

        /// <summary>
        /// Returns contact info for specified login/password
        /// </summary>
        /// <param name="login"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public RowResult LoginContact(string login, string password)
        {
            RowResult contact = null;

            // Create request.
            var request = new Dictionary<string, object>();
            request[ContactConstants.Login] = login;
            request[ContactConstants.Password] = password;

            // Send request to Eclipse and get the response.
            try
            {
                contact = RequestContact(ContactConstants.Contact, request);
            }
            catch (Contingency c)
            {
                if (c.Code.Equals(ContactConstants.InvalidLogin))
                {
                    contact = null;
                }
            }

            return contact;
        }
		public RowResult GetContact(int contactId)
		{
			RowResult contact = null;

			// Create request.
			var request = new Dictionary<string, object>();
			request[ContactConstants.ContactID] = contactId;

			// Send request to Eclipse and get the response.
			contact = RequestContact(ContactConstants.Contact, request);

			return contact;
		}

		public virtual bool DeleteContact(int contactId)
		{
			Dictionary<string, object> contact = new Dictionary<string, object>();
			contact[ContactConstants.ContactID] = contactId;

			var result = SendUpload(ContactConstants.DeleteContact, contact);

			if (result == null)
			{
				return false;
			}
			else
			{
				return true;
			}
		}


		private RowResult RequestContact(string transferClass, Dictionary<string, object> request)
		{
		    Connection conn = null;
		    try
		    {
		        conn = ConnectionPool.GetConnection();
		        return conn.RequestResponse(transferClass, request);
		    }
		    finally
		    {
		        if (conn != null)
		        {
		            conn.Close();
		        }
		    }
		}

	}

}
