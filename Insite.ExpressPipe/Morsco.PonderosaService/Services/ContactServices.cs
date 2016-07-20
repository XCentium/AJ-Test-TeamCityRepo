using System.Collections.Generic;
using Insite.Core.Context;
using Morsco.PonderosaService.Constants;
using Morsco.PonderosaService.Repositories;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Services
{

    public class ContactServices
    {
		private readonly ContactRepository _contactRepository = new ContactRepository();

		public int AddContact(IDictionary<string, object> contact)
	    {
			return _contactRepository.RunWithRetry<int>("AddContact", new object[] { contact });
	    }

        public int GetContactId(string login, string password)
        {
            return _contactRepository.RunWithRetry<int>("GetContactId", new object[] {login, password});
        }

		public RowResult GetContact(int contactId)
		{
			return _contactRepository.RunWithRetry<RowResult>("GetContact", new object[] { contactId });
		}

		public IDictionary<string, object> InitiateAddNewCreditCard(string origin, IDictionary<string, object> user)
		{
			return _contactRepository.RunWithRetry<IDictionary<string, object>>("InitiateAddNewCreditCard", new object[] { SiteContext.Current, origin, user });
	    }

		public string FinalizeNewCreditCard(int contactId, Dictionary<string, object> setupResult, string billToId)
	    {
			return _contactRepository.RunWithRetry<string>("FinalizeNewCreditCard", new object[] { contactId, setupResult, billToId });
	    }

		public bool DeleteContact(int contactId)
		{
			return _contactRepository.RunWithRetry<bool>("DeleteContact", new object[] { contactId });
		}

		public Dictionary<string, object> MapUserToContact(IDictionary<string, object> user, int customerId)
		{
			Dictionary<string, object> contact = new Dictionary<string, object>();

			// Required for new contacts
			contact[ContactConstants.CustomerID] = customerId;
			contact[ContactConstants.FirstName] = "..";
			contact[ContactConstants.LastName] = user[ContactConstants.CardHolderName];

			// Contact address (optional)
			Dictionary<string, object> contactAddress = new Dictionary<string, object>();
			contactAddress[ContactConstants.Address] = user[ContactConstants.BillingAddress];
			contactAddress[ContactConstants.City] = user[ContactConstants.City];
			contactAddress[ContactConstants.State] = user[ContactConstants.State];
			contactAddress[ContactConstants.Zip] = user[ContactConstants.Zip];
			contact[ContactConstants.ContactAddress] = contactAddress;

			// User ID for Eclipse change log (required)
			contact[ContactConstants.ChangedBy] = ContactConstants.WebsiteTest;

			// Access stuff required
			Dictionary<string, object> access = new Dictionary<string, object>();
			access[ContactConstants.Login] = user[ContactConstants.Email];
			access[ContactConstants.Password] = ContactConstants.NotApplicable;
			contact[ContactConstants.AccessControl] = access;

			return contact;
		}
	}
}