using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using Insite.Common;
using Insite.Common.Logging;
using Insite.Common.Providers;
using Insite.Core.Attributes;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Plugins.Emails;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Core.Translation;
using Insite.Data.Entities;
using Insite.Data.Extensions;
using Insite.Data.Repositories.Interfaces;
using Morsco.Customizations.Lib.EmailService;

namespace Morsco.Customizations.Lib.Services
{
    [ModuleService("MorscoEmailService", "InSiteCommerce.Web")]
    public class EmailService_Morsco : Insite.Plugins.Emails.EmailService
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public EmailService_Morsco(IEmailTemplateUtilities emailTemplateUtilities, IContentManagerUtilities contentManagerUtilities,
            IEntityTranslationService entityTranslationService, IUnitOfWorkFactory unitOfWorkFactory)
            : base(emailTemplateUtilities, contentManagerUtilities, entityTranslationService)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        protected void DoActualSendWithAttachment(EmailMessage emailMessage, EmailMessageDeliveryAttempt currentDeliveryAttempt, string attachment)
        {
            bool flag = false;
            var message = ConvertEmailMessageToMailMessage(emailMessage);

            message.Attachments.Add(new Attachment(attachment));
            string orCreateByName = _unitOfWorkFactory.GetUnitOfWork().GetTypedRepository<IApplicationSettingRepository>()
                .GetOrCreateByName<string>("Email_TestEmailAddress");

            if (!orCreateByName.IsBlank())
            {
                message.To.Clear();
                message.To.Add(orCreateByName);
            }
            try
            {
                new SmtpClient().Send(message);
                flag = true;
                if (File.Exists(attachment))
                {
                    message.Attachments.Dispose();
                    File.Delete(attachment);
                }
            }
            catch (Exception exception)
            {
                currentDeliveryAttempt.ErrorMessage = exception.ToString();
                LogHelper.For(this).Error("There was a problem sending the email with an attachment " + emailMessage.Id, exception);
            }
            if (flag)
            {
                currentDeliveryAttempt.DeliveredDate = DateTimeProvider.Current.Now;
            }
        }

        public virtual void ParseAndSendEmail(string htmlTemplate, ExpandoObject templateModel, string emailTemplateName, SendEmailParameter sendEmailParameter)
        {
            sendEmailParameter.Body = ParseTemplate(htmlTemplate, templateModel, emailTemplateName);
            if (((IDictionary<string, object>)templateModel).ContainsKey("Attachment"))
            {
                var attachment = ((IDictionary<string, object>)templateModel)["Attachment"].ToString();
                sendEmailParameter.ExtendedProperties.Add("Attachment", attachment);
            }

            SendEmail(sendEmailParameter, _unitOfWorkFactory.GetUnitOfWork());
        }

        public override void SendEmail(SendEmailParameter parameter, IUnitOfWork unitOfWork)
        {
            foreach (string str in parameter.ToAddresses)
            {
                if (!RegularExpressionLibrary.IsValidEmail(str))
                {
                    throw new ArgumentException("The value '{email}' in the ToAddresses collection is not a valid email address".FormatWith(new { email = str }));
                }
            }
            if (!RegularExpressionLibrary.IsValidEmail(parameter.FromAddress))
            {
                throw new ArgumentException("The value '{email}' for the FromAddress is not a valid email address".FormatWith(new { email = parameter.FromAddress }));
            }
            foreach (string str2 in parameter.ReplyToAddresses)
            {
                if (!RegularExpressionLibrary.IsValidEmail(str2))
                {
                    throw new ArgumentException("The value '{email}' in the ReplyToAddresses collection is not a valid email address".FormatWith(new { email = str2 }));
                }
            }
            foreach (string str3 in parameter.CCAddresses)
            {
                if (!RegularExpressionLibrary.IsValidEmail(str3))
                {
                    throw new ArgumentException("The value '{email}' in the CCAddresses collection is not a valid email address".FormatWith(new { email = str3 }));
                }
            }
            foreach (string str4 in parameter.BccAddresses)
            {
                if (!RegularExpressionLibrary.IsValidEmail(str4))
                {
                    throw new ArgumentException("The value '{email}' in the BccAddresses collection is not a valid email address".FormatWith(new { email = str4 }));
                }
            }
            IRepository<EmailMessage> repository = unitOfWork.GetRepository<EmailMessage>();
            EmailMessage inserted = repository.Create();
            inserted.Body = parameter.Body;
            inserted.Subject = parameter.Subject;
            repository.Insert(inserted);
            foreach (string str5 in parameter.ToAddresses)
            {
                EmailMessageAddress address = new EmailMessageAddress
                {
                    EmailAddress = str5,
                    Type = EmailMessageAddressType.To.ToString()
                };
                inserted.EmailMessageAddresses.Add(address);
            }
            EmailMessageAddress address5 = new EmailMessageAddress
            {
                EmailAddress = parameter.FromAddress,
                Type = EmailMessageAddressType.From.ToString()
            };
            inserted.EmailMessageAddresses.Add(address5);
            foreach (string str6 in parameter.CCAddresses)
            {
                EmailMessageAddress address2 = new EmailMessageAddress
                {
                    EmailAddress = str6,
                    Type = EmailMessageAddressType.CC.ToString()
                };
                inserted.EmailMessageAddresses.Add(address2);
            }
            foreach (string str7 in parameter.BccAddresses)
            {
                EmailMessageAddress address3 = new EmailMessageAddress
                {
                    EmailAddress = str7,
                    Type = EmailMessageAddressType.BCC.ToString()
                };
                inserted.EmailMessageAddresses.Add(address3);
            }
            foreach (string str8 in parameter.ReplyToAddresses)
            {
                EmailMessageAddress address4 = new EmailMessageAddress
                {
                    EmailAddress = str8,
                    Type = EmailMessageAddressType.ReplyTo.ToString()
                };
                inserted.EmailMessageAddresses.Add(address4);
            }
            EmailMessageDeliveryAttempt attempt = new EmailMessageDeliveryAttempt();
            inserted.EmailMessageDeliveryAttempts.Add(attempt);
            if (parameter.ExtendedProperties["Attachment"] != null)
            {
                DoActualSendWithAttachment(inserted, attempt, parameter.ExtendedProperties["Attachment"]);
            }
            else
            {
                DoActualSend(inserted, attempt, null);
            }
            unitOfWork.Save();
        }

        public override void SendEmailList(Guid emailListId, IList<string> toAddresses, ExpandoObject templateModel, string subject, IUnitOfWork unitOfWork)
        {
            foreach (string str in toAddresses.Where(x => !RegularExpressionLibrary.IsValidEmail(x)))
            {
                throw new ArgumentException("To address: " + str + " is not a valid email address.");
            }

            string orCreateByName = unitOfWork.GetTypedRepository<IApplicationSettingRepository>().GetOrCreateByName<string>("DefaultEmailAddress");

            var emailList = unitOfWork.GetRepository<EmailList>().GetTable()
                .Expand(x => x.EmailTemplate)
                .Expand(x => x.EmailTemplate.CustomProperties)
                .FirstOrDefault(x => x.Id == emailListId);
            if (emailList == null)
                return;

            var sendEmailParameter = new SendEmailParameter
            {
                ToAddresses = toAddresses,
                FromAddress = emailList.FromAddress.IsBlank() ? orCreateByName : emailList.FromAddress,
                Subject = !subject.IsBlank() ? subject: EntityTranslationService.TranslateProperty(emailList, o => o.Subject)
            };

            var prop = emailList.EmailTemplate.CustomProperties.FirstOrDefault(x => x.Name == "SendViaExactTarget");
            bool value;
            if (prop != null && bool.TryParse(prop.Value, out value) && value)
            {
                SendEmailToExactTarget(templateModel, emailList.EmailTemplate.Name, sendEmailParameter, unitOfWork);
            }
            else
            {
                ParseAndSendEmail(GetHtmlTemplate(emailList), templateModel, emailList.EmailTemplate.Name, sendEmailParameter, unitOfWork);
            }
        }

        private void SendEmailToExactTarget(ExpandoObject templateModel, string templateName, SendEmailParameter sendEmailParameter, IUnitOfWork unitOfWork)
        {
            var triggeredSends = sendEmailParameter.ToAddresses.Select(x => new TriggeredSendDto
            {
                SendId = Guid.NewGuid(),
                CustomerKey = templateName,
                Recipient = x,
                Attributes = templateModel
            }).ToList();

            var repo = new EmailServiceRepository();
            repo.InsertTriggeredSends(triggeredSends);
        }
    }
}
