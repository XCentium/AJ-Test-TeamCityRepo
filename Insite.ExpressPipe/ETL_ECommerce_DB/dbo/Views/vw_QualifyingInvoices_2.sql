




CREATE VIEW [dbo].[vw_QualifyingInvoices] AS
	SELECT [ETLSourceID]
      ,[InvoiceID] 
      ,[BillToCustomerID]
	  ,CASE WHEN ISNULL([ShipToCustomerID],'') = [BillToCustomerID] THEN '' ELSE ISNULL([ShipToCustomerID],'') END [ShipToCustomerID]
      ,[PriceBranchID]
      ,[ShipBranchID]
      ,[GLBranchID]
      ,[InvoiceType] 
      ,[InvoiceStatus] 
      ,[OrderDate]
      ,[InvoiceDate] 
      ,[DiscountAmount]
      ,[SubTotalAmount]
      ,[TotalCOGSAmount]
      ,[FreightAmount]
      ,[HandlingAmount]
      ,[SalesTaxAmount]
      ,[InvoiceAmount] 
	  ,[BalanceDueAmount]
      ,[InsideSalesPersonID]
      ,[OutsideSalesPersonID]
      ,[WriterID]
      ,[OrderedBy]
      ,[CustomerPO] 
      ,[SaleSource]
      ,[ShipViaID]
      ,[TermsCD]
      ,[DiscountDate]
      ,[DueDate]
	  ,[ShipToAddress1]
      ,[ShipToAddress2]
      ,[ShipToAddress3]
      ,[ShipToCity]
      ,[ShipToState]
      ,[ShipToZip]
      ,[EclipseID] 
      ,[ExportDate]
  FROM [DM_ECommerce].[ksa].[vw_AllInvoiceHeaders]
  WHERE 
	-- Beginning of month 24 months ago
	OrderDate >= CAST(
							CAST(DATEPART(YEAR, GETDATE()) - 2 AS VARCHAR(4))
							+ '-' + CAST(DATEPART(MONTH, GETDATE()) AS VARCHAR(2))
							+ '-01' AS DATETIME)