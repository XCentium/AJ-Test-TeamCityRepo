using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Plugins.Emails;
using Insite.WebFramework.Mvc;
using System;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Insite.Data.Repositories;

namespace Morsco.Customizations.Lib.Controllers
{
    public class ContactUsController : BaseController
    {
        protected readonly IEmailService EmailService;

        public ContactUsController(IUnitOfWorkFactory unitOfWorkFactory, IEmailService emailService)
            : base(unitOfWorkFactory)
        {
            EmailService = emailService;
        }

        private void SendEmail(string firstName, string lastName, string message, string topic, string emailAddress, string emailTo)
        {
            dynamic obj2 = new ExpandoObject();
            obj2.FirstName = firstName;
            obj2.LastName = lastName;
            obj2.Email = emailAddress;
            obj2.Topic = topic;
            obj2.Message = message;
            var emailRepo = new EmailListRepository();
            var list = emailRepo.GetOrCreateByName("ContactUsTemplate", "Contact Us");
            EmailService.SendEmailList(list.Id, emailTo.Split(new char[] { ',' }).ToList(), obj2, "Contact Us Submission: " + topic, UnitOfWork);
        }


        private void SendEmailWithAttachment(string firstName, string lastName, string message, string topic, string emailAddress, string emailTo, string attachmentLocation)
        {
            dynamic obj2 = new ExpandoObject();
            obj2.FirstName = firstName;
            obj2.LastName = lastName;
            obj2.Email = emailAddress;
            obj2.Topic = topic;
            obj2.Message = message;
            obj2.Attachment = attachmentLocation;

            var emailRepo = new EmailListRepository();
            var list = emailRepo.GetOrCreateByName("CareersFormTemplate", "Contact Us");
            EmailService.SendEmailList(list.Id, emailTo.Split(new char[] { ',' }).ToList(), obj2, "Contact Us Submission: " + topic, UnitOfWork);
        }

        [HttpPost]
        public virtual ActionResult Submit(string firstName, string lastName, string message, string topic, string emailAddress, string emailTo)
        {
            SendEmail(firstName, lastName, message, topic, emailAddress, emailTo);
            return base.Json(new { Success = true });
        }

        [HttpPost]
        public virtual ActionResult SubmitWithAttachment(string firstName, string lastName, string message, string topic, string emailAddress, string emailTo)
        {
            HttpPostedFileBase attachment = Request.Files[0];

            if (attachment != null && attachment.ContentLength > 0)
            {
                var path = AppDomain.CurrentDomain.BaseDirectory + @"temp\";
                var location = Path.Combine(path, Path.GetFileName(attachment.FileName));
                attachment.SaveAs(location);
                SendEmailWithAttachment(firstName, lastName, message, topic, emailAddress, emailTo, location);
            }
            else
            {
                SendEmail(firstName, lastName, message, topic, emailAddress, emailTo);
            }

            return base.Json(new { Success = true });
        }
    }
}

