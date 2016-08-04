using System;
using System.Linq;
using Insite.Catalog.Services;
using Insite.Catalog.Services.Parameters;
using Insite.Customers.Services;
using Morsco.Customizations.Lib.Interfaces;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;
using Insite.Catalog.WebApi.V1.ApiModels;
using Insite.Catalog.WebApi.V1.Mappers.Interfaces;
using System.Net.Http;
using Insite.Catalog.Services.Dtos;
using Insite.Core.Context;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Data.Entities;
using System.Web.Configuration;
using System.Web.Script.Serialization;

namespace Morsco.Customizations.Lib.Repositories
{
    public class ProductHistoryRepository : BaseRepository, IProductHistoryRepository, IInterceptable
    {
        private readonly IGetProductCollectionMapper _getProductCollectionMapper;

        public ProductHistoryRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService,
            IProductService productService, IGetProductCollectionMapper getProductCollectionMapper)
            : base(unitOfWorkFactory, customerService, productService)
        {
            _getProductCollectionMapper = getProductCollectionMapper;
        }

        public ProductHistoryRepository(IUnitOfWorkFactory unitOfWorkFactory, ICustomerService customerService, IProductService productService) : base(unitOfWorkFactory, customerService, productService)
        {
        }

        public DataTable SelectPurchasedProducts(int page, int perPage, string searchTerm)
        {

            var connectionString = ConfigurationManager.ConnectionStrings["InSite.Commerce"].ConnectionString;

            var dt = new DataTable();

            using (var conn = new SqlConnection(connectionString))
            {
                conn.Open();
                var command = new SqlCommand("Custom.SelectPurchasedProducts", conn) {CommandType = CommandType.StoredProcedure};

                command.Parameters.Add(SiteContext.Current.BillTo.CustomerNumber == null
                    ? new SqlParameter("@CustomerNumber", DBNull.Value)
                    : new SqlParameter("@CustomerNumber", SiteContext.Current.BillTo.CustomerNumber));

                command.Parameters.Add(SiteContext.Current.ShipTo?.CustomerSequence == null
                    ? new SqlParameter("@CustomerSequence", DBNull.Value)
                    : new SqlParameter("@CustomerSequence", SiteContext.Current.ShipTo.CustomerSequence));

                command.Parameters.Add(new SqlParameter("@page", page));
                command.Parameters.Add(new SqlParameter("@perPage", perPage));
                command.Parameters.Add(new SqlParameter("@searchTerm", searchTerm));
                var dataReader = command.ExecuteReader();

                dt.Load(dataReader);


                conn.Close();
            }
            return dt;
        }

        public ProductCollectionModel GetPurchasedProducts(int page, int perPage, string searchTerm, HttpRequestMessage httpRequest)
        {
			var dt = SelectPurchasedProducts(page, perPage, searchTerm);
            ProductCollectionModel result;

            // We might not get any products from this query because 
            //  Purchased Products are only catalog purchased products
            //  or because this is a new customer
            if (dt.Rows.Count > 0)
            {
                var rowDict = dt.Select().ToDictionary(prod => (Guid) prod["ProductId"]);
                var products = rowDict.Select(r => r.Key).ToList();
                var totalRecords = 1;
                if (rowDict.Count > 0)
                {
                    totalRecords = Convert.ToInt32(rowDict.FirstOrDefault().Value["TotalRecords"]);
                }

                var totalPages = CalculatePages(totalRecords, perPage);
                var param = new GetProductCollectionParameter()
                {
                    GetPrices = true,
                    AllowedProductIds = products,
                    StartPage = 1,
                    PageSize = products.Count
                };
                var productCollectionResult = ProductService.GetProductCollection(param);

                foreach (var p in productCollectionResult.ProductDtos)
                {
                    p.QtyOrdered = 1;

                    if (rowDict.Keys.Contains(p.Id))
                    {
                        var queryProduct = rowDict[p.Id];
                        p.Properties.Add("Purchased", queryProduct["Purchased"].ToString());
                        p.Properties.Add("LastOrderedDate", queryProduct["OrderDate"].ToString());
                    }
                    else
                    {
                        throw new Exception($"Matching product not found for {p.Id}.");
                    }
                }

                result = _getProductCollectionMapper.MapResult(productCollectionResult, httpRequest);

                result.Products = result.Products.OrderByDescending(x => Convert.ToInt32(x.Properties["Purchased"])).ToList();
                result.Properties.Add("totalPages", totalPages.ToString());
                result.Properties.Add("totalRecords", totalRecords.ToString());
                result.Uri = httpRequest.RequestUri.ToString();

				result.Properties.Add("warehouses", productCollectionResult.Properties["warehouses"]);
			}
			else
            {
                result = new ProductCollectionModel
                {
                    Products = new List<ProductDto>(),
                    Properties = new Dictionary<string, string>
                    {
                        {"totalPages", "0"},
                        {"totalRecords", "0"}
                    },
                    Uri = httpRequest.RequestUri.ToString()
                };
            }
            return result;
        }

        private int CalculatePages(int totalRecords, int recordsPerPage)
        {
            if (totalRecords == 0) { return 1; }
            return ((totalRecords - 1) / recordsPerPage) + 1;
        }

    }
}
