using Insite.Catalog.Services;
using Insite.Catalog.Services.Parameters;
using Insite.Catalog.Services.Results;
using Insite.Catalog.WebApi.V1.ApiModels;
using Insite.Catalog.WebApi.V1.Mappers.Interfaces;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.BulkUpload.Models;
using Morsco.Customizations.Lib.Interfaces;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net.Http;

namespace Morsco.Customizations.Lib.Repositories
{
    public class BulkUploadRepository : BaseRepository, IBulkUploadRepository, IInterceptable
    {
        private readonly IGetProductCollectionMapper _getProductCollectionMapper;
        
        public BulkUploadRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService, 
            IGetProductCollectionMapper getProductCollectionMapper)
            : base(unitOfWorkFactory, customerService, productService)
        {
            _getProductCollectionMapper = getProductCollectionMapper;
        }

        public ProductCollectionModel GetBulkUploadProducts(BulkUploadRequest uploadRequest, HttpRequestMessage httpRequest)
        {
            var connectionString = ConfigurationManager.ConnectionStrings["InSite.Commerce"].ConnectionString;

            var dt = new DataTable();
            var products = new List<Guid>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();
                var command = new SqlCommand("Custom.GetProductsMatchingUpload", conn);
                command.CommandType = CommandType.StoredProcedure;
                if (!string.IsNullOrEmpty(uploadRequest.PartNumber))
                {
                    command.Parameters.Add(new SqlParameter("@SearchField", uploadRequest.PartNumber));
                    command.Parameters.Add(new SqlParameter("@WebsiteName", SiteContext.Current.Website.Name));
                    var dataReader = command.ExecuteReader();

                    dt.Load(dataReader);
                }
                conn.Close();


            }

            if (dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    products.Add((Guid)row["Id"]);
                }
            }

            var param = new GetProductCollectionParameter()
            {
                GetPrices = false,
                AllowedProductIds = products,
            };


            GetProductCollectionResult productCollectionResult = ProductService.GetProductCollection(param);
            foreach (var p in productCollectionResult.ProductDtos)
            {
                p.QtyOrdered = 1;

            }
            ProductCollectionModel result = _getProductCollectionMapper.MapResult(productCollectionResult, httpRequest);
            result.Uri = httpRequest.RequestUri.ToString();
            
            return result;
        }
    }
}
