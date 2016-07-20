

CREATE PROCEDURE [dbo].[sp_PopulateETLProductList]
--
-- Name:      sp_PopulateETLProductList
-- Descr:     Populate ETL Product Lists
-- Created:   8/27/2015 Matt Glover XCentium
-- Note:    MUST BE RUN AFTER ETL ProductHistory POPULATION
-- Altered:
-- Test With: exec sp_PopulateETLProductList 'ServiceUser'
(
       @UserName VARCHAR(50) 
)
AS
--*****************************************************************************************************************
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLProductList] 'ServiceUser'
--*****************************************************************************************************************
BEGIN

	   TRUNCATE TABLE ProductList;

       SET NOCOUNT ON
       SET XACT_ABORT ON

       DECLARE @24MonthsAgo DATETIME = CAST(
                                            CAST(DATEPART(YEAR, GETDATE()) - 2 AS VARCHAR(4))
                                            + '-' + CAST(DATEPART(MONTH, GETDATE()) AS VARCHAR(2))
                                            + '-01' AS DATETIME)

       DECLARE @ProductListTypeId UNIQUEIDENTIFIER = (SELECT Id FROM ProductListType WHERE ListType = 'ShipToCust24Mo');

	   print @ProductListTypeId
       -- Previously Purchased Products - By Ship To Customer for last 24 months 
       INSERT ProductList 
       (
              ProductListTypeId, 
              CustomerId, 
              ProductId, 
              CustomerNumber, 
              CustomerSequence, 
              ProductErpNumber, 
              Frequency,
			  QtyOrdered,
			  QtyShipped,
			  LastOrderedDate,
			  LastShippedDate,
              CreatedOn,
              CreatedBy,
              ModifiedOn,
              ModifiedBy
       )
       SELECT 
              @ProductListTypeId, 
              C.ID, 
              P.ID, 
              O.CustomerNumber, 
              O.CustomerSequence, 
              L.ProductERPNumber, 
              COUNT(*) Frequency,
			  SUM(L.QtyOrdered) QtyOrdered,
			  SUM(L.QtyShipped) QtyShipped,
			  MAX(O.OrderDate) LastOrderedDate,
			  MAX(L.LastShipDate) LastShippedDate,
              GETDATE(),
              @UserName,
              GETDATE(),
              @UserName
       FROM [Insite.Morsco]..OrderHistory O (NOLOCK) 
       JOIN [Insite.Morsco]..OrderHistoryLine L (NOLOCK)  ON L.OrderHistoryID = O.ID
       JOIN [Insite.Morsco]..Customer C (NOLOCK)  ON C.CustomerNumber = O.CustomerNumber AND ISNULL(C.CustomerSequence,'') = ISNULL(O.CustomerSequence,'')
       JOIN [Insite.Morsco]..Product P (NOLOCK)  ON P.ERPNumber = L.ProductERPNumber
       WHERE O.OrderDate > @24MonthsAgo
       GROUP BY C.ID, P.ID, O.CustomerNumber, O.CustomerSequence, L.ProductERPNumber

       -- Previously Purchased Products - By Bill To Customer for last 24 months
       SET @ProductListTypeId = (SELECT Id FROM ProductListType (NOLOCK)  WHERE ListType = 'BillToCust24Mo');

       INSERT ProductList 
       (
              ProductListTypeId, 
              CustomerId, 
              ProductId, 
              CustomerNumber, 
              CustomerSequence, 
              ProductErpNumber, 
              Frequency,
			  QtyOrdered,
			  QtyShipped,
			  LastOrderedDate,
			  LastShippedDate,
              CreatedOn,
              CreatedBy,
              ModifiedOn,
              ModifiedBy
       )
       SELECT 
              @ProductListTypeId, 
              C.ID, 
              P.ID, 
              O.CustomerNumber, 
              '', 
              L.ProductERPNumber, 
              COUNT(*) Frequency,
			  SUM(L.QtyOrdered) QtyOrdered,
			  SUM(L.QtyShipped) QtyShipped,
			  MAX(O.OrderDate) LastOrderedDate,
			  MAX(L.LastShipDate) LastShippedDate,
              GETDATE(),
              @UserName,
              GETDATE(),
              @UserName
       FROM [Insite.Morsco]..OrderHistory O (NOLOCK) 
       JOIN [Insite.Morsco]..OrderHistoryLine L (NOLOCK)  ON L.OrderHistoryID = O.ID
       -- Bill To Customer
       JOIN [Insite.Morsco]..Customer C (NOLOCK)  ON C.CustomerNumber = O.CustomerNumber AND ISNULL(C.CustomerSequence,'') = ''
       JOIN [Insite.Morsco]..Product P (NOLOCK)  ON P.ERPNumber = L.ProductERPNumber
       WHERE O.OrderDate > @24MonthsAgo
       GROUP BY C.ID, P.ID, O.CustomerNumber, L.ProductERPNumber


       --Popular Products - For all of Morsco for last 24 months
       SET @ProductListTypeId = (SELECT Id FROM ProductListType WHERE ListType = 'AllCust24Mo');
       
       INSERT ProductList 
       (
              ProductListTypeId, 
              CustomerId, 
              ProductId, 
              CustomerNumber, 
              CustomerSequence, 
              ProductErpNumber, 
              Frequency,
			  QtyOrdered,
			  QtyShipped,
			  LastOrderedDate,
			  LastShippedDate,
              CreatedOn,
              CreatedBy,
              ModifiedOn,
              ModifiedBy
       )
       SELECT TOP 64
              @ProductListTypeId, 
              NULL, 
              P.ID, 
              '', 
              '', 
              L.ProductERPNumber, 
              COUNT(*) Frequency,
			  SUM(L.QtyOrdered) QtyOrdered,
			  SUM(L.QtyShipped) QtyShipped,
			  MAX(O.OrderDate) LastOrderedDate,
			  MAX(L.LastShipDate) LastShippedDate,
              GETDATE(),
              @UserName,
              GETDATE(),
              @UserName

       FROM [Insite.Morsco]..OrderHistory O (NOLOCK) 
       JOIN [Insite.Morsco]..OrderHistoryLine L (NOLOCK)  ON L.OrderHistoryID = O.ID
       JOIN [Insite.Morsco]..Product P (NOLOCK)  ON P.ERPNumber = L.ProductERPNumber
       WHERE O.OrderDate > @24MonthsAgo
       GROUP BY P.ID, L.ProductERPNumber
	   ORDER BY Frequency desc

--*******************************************************************************************************************
--Check for Existing IDs
--*******************************************************************************************************************

		UPDATE EPL
		   SET EPL.Id = IPL.Id
		  FROM ETL_ECommerce..ProductList EPL
	INNER JOIN [Insite.Morsco].Custom.ProductList IPL (NOLOCK) 
	         ON EPL.ProductListTypeId = IPL.ProductListTypeId
		   AND EPL.CustomerId = IPL.CustomerId
		   AND EPL.ProductId = IPL.ProductId
END