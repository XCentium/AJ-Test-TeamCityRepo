using System;
using System.Data;
using System.Data.SqlClient;
using Insite.Catalog.Services;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Customers.Services;
using Insite.Customers.WebApi.V1.ApiModels;
using Insite.Data.Entities;
using Morsco.Customizations.Lib.BillToMin.Models;
using Morsco.Customizations.Lib.Interfaces;

namespace Morsco.Customizations.Lib.Repositories
{
    public class BillToMinRepository : BaseRepository, IBillToMinRepository, IInterceptable
    {
        public BillToMinRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService,
            IProductService productService)
            : base(unitOfWorkFactory, customerService, productService)
        {}

        /// <summary>
        /// Get Bill To Customers and their Ship To Customers assigned to this user, or else limit to specific customerId
        /// Optionally eliminate the "Extra" ISC* addresses
        /// </summary>
        /// <param name="currentBillToOnly"></param>
        /// <param name="includeExtraAddresses"></param>
        /// <returns></returns>
        public BillToMinResult GetBillToMin(bool currentBillToOnly = false, bool includeExtraAddresses = true)
        {
            UserProfile userProfile = SiteContext.Current.UserProfile;

            if (userProfile == null)
                throw new Exception("User not authorized");

            var customerId = currentBillToOnly ? SiteContext.Current.BillTo.Id : (Guid?)null;

            var dt = GetBillToMin2(userProfile.Id, customerId, includeExtraAddresses);

            //Response is structured and ordered so that Level 1 is the bill-to and the ship-tos immediately following belong to it
            var result = new BillToMinResult();
            CustomerMinModel thisBillTo = null;
            foreach (DataRow row in dt.Rows)
            {
                var level = row["Level"].ToString();
                var id = row["Id"].ToString();
                var customerNumber = row["CustomerNumber"].ToString();
                var label = row["Label"].ToString();

                if (level == "1")
                {
                    if (thisBillTo != null)
                    {
                        result.BillTos.Add(thisBillTo);
                    }
                    thisBillTo = new CustomerMinModel()
                    {
                        Id = id,
                        Label = label
                    };
                }
                else
                {
                    thisBillTo.ShipTos.Add(new CustomerMinModel
                    {
                        Id = id,
                        Label = label
                    });
                }

            }
            //add the last billto in the list
            if (thisBillTo != null)
            {
                result.BillTos.Add(thisBillTo);
            }

            return result;
        }

        private DataTable GetBillToMin2(Guid userProfileId, Guid? customerId, bool includeExtraAddresses = true)
        {
            var dt = new DataTable();
            using (var conn = GetOpenConnection())
            {
                var command = new SqlCommand("Custom.GetBillToMin", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                command.Parameters.AddWithValue("@UserProfileId", userProfileId);
                command.Parameters.AddWithValue("@BillToId", customerId ?? (object) DBNull.Value);
                command.Parameters.AddWithValue("@IncludeExtraAddresses", (object)includeExtraAddresses ?? DBNull.Value);

                var dataReader = command.ExecuteReader();
                dt.Load(dataReader);

                conn.Close();
            }
            return dt;
        }
    }
}

