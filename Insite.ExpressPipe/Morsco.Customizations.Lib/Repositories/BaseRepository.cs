using Insite.Catalog.Services;
using Insite.Core.Interfaces.Data;
using Insite.Customers.Services;
using System;
using System.Configuration;
using System.Data.SqlClient;

namespace Morsco.Customizations.Lib.Repositories
{
    public class BaseRepository
    {
        private readonly string _connectionString;
        protected IUnitOfWorkFactory UnitOfWorkFactory { get; set; }
        protected readonly ICustomerService CustomerService;
        protected readonly IProductService ProductService;

        protected BaseRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService)
        {
            _connectionString = ConfigurationManager.ConnectionStrings["InSite.Commerce"].ConnectionString;
            UnitOfWorkFactory = unitOfWorkFactory;
            CustomerService = customerService;
            ProductService = productService;
        }

        protected SqlConnection GetOpenConnection()
        {
            var result = new SqlConnection(_connectionString);
            result.Open();
            return result;
        }

        protected SqlParameter GetParameter(string parameterName, object value)
        {
            object parameterValue = value ?? DBNull.Value;
            return new SqlParameter(parameterName, parameterValue);
        }

        protected DateTime? GetNullableDateTime(SqlDataReader rdr, string key)
        {
            return (rdr[key] != DBNull.Value) ? (DateTime?) rdr[key] : null;
        }
    }
}
