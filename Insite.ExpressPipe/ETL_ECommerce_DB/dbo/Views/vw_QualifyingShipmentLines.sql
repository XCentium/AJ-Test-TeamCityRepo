




CREATE VIEW [dbo].[vw_QualifyingShipmentLines]
AS
SELECT [ETLSourceID]
      ,[ShipmentID]
      ,[LineNumber]
      ,[ProductID]
      ,[StockQty]
      ,[DirectQty]
      ,[OrderQty]
      ,[ShippedQty]
      ,[Price]
      ,[UOM]
      ,[PriceOverride]
      ,[PriceOverrideFlag]
      ,[COGS]
      ,[COGSOverride]
      ,[COGSOverrideFlag]
      ,[MiscChargeFlag]
      ,[ProductDescription]
      ,[EclipseID] 
      ,[ExportDate]
  FROM [DM_ECommerce].[ksa].[vw_AllShipmentLines]