












CREATE VIEW [dbo].[vw_QualifyingShipments]
AS

SELECT 
		ROW_NUMBER() OVER (Partition By [EclipseID] ORDER BY [ShipmentID]) [GenRowNo]
		, COUNT(*) OVER(PARTITION BY [EclipseID]) AS GenerationCount
	  ,[ETLSourceID]
      ,[ShipmentID]
	  ,Upper([EclipseID]) [EclipseID]  
	  ,[GenerationID]
      ,[BillToCustomerID]
	  ,CASE WHEN ISNULL([ShipToCustomerID],'') = [BillToCustomerID] THEN '' ELSE ISNULL([ShipToCustomerID],'') END [ShipToCustomerID]
      ,[PriceBranchID]
      ,[ShipBranchID]
      ,[GLBranchID]
      ,[ShipmentType] OrderType
      ,[ShipmentStatus] OrderStatus
      ,[ShipWhen]
      ,[OrderDate]
      ,[ShipDate]
      ,[DiscountAmount]
      ,[SubTotalAmount]
      ,[TotalCOGSAmount]
      ,[FreightAmount]
      ,[HandlingAmount]
      ,[SalesTaxAmount]
      ,[ShipmentAmount]
      ,[InsideSalesPersonID]
      ,[OutsideSalesPersonID]
      ,[WriterID]
      ,[OrderedBy]
      ,[CustomerPO] 
      ,[SaleSource]
      ,[ShipViaID]
      ,[WaybillNo]
      ,[TermsCD]
      ,[DiscountDate]
      ,[DueDate]
	  ,[ShipToAddress1]
      ,[ShipToAddress2]
      ,[ShipToAddress3]
      ,[ShipToCity]
      ,[ShipToState]
      ,[ShipToZip]
      ,[ExportDate]
  FROM [DM_ECommerce].[ksa].[vw_AllShipmentHeaders]
  WHERE 
	-- Beginning of month 24 months ago
	OrderDate >= CAST(
							CAST(DATEPART(YEAR, GETDATE()) - 2 AS VARCHAR(4))
							+ '-' + CAST(DATEPART(MONTH, GETDATE()) AS VARCHAR(2))
							+ '-01' AS DATETIME)