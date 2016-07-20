CREATE PROCEDURE [dbo].[sp_PopulateInsiteOrderHistory]
--*****************************************************************************************************************
-- Name:	sp_PopulateInsiteOrderHistory
-- Descr:	Populate Insite OrderHistory and OrderHistoryLine with the values in ETL_ECommerce
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteOrderHistory] 'EXP'
--*****************************************************************************************************************

(
	
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			--==========================================================================================================
			-- Merge OrderHistory
			--==========================================================================================================

			;MERGE [Insite.Morsco]..OrderHistory AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..OrderHistory AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.ERPOrderNumber <> Source.ERPOrderNumber
				OR Target.WebOrderNumber <> Source.WebOrderNumber
				OR Target.OrderDate <> Source.OrderDate
				OR Target.Status <> Source.Status
				OR Target.CustomerNumber <> Source.CustomerNumber
				OR Target.CustomerSequence <> Source.CustomerSequence
				OR Target.CustomerPO <> Source.CustomerPO
				OR Target.CurrencyCode <> Source.CurrencyCode
				OR Target.Terms <> Source.Terms
				OR Target.ShipCode <> Source.ShipCode
				OR Target.Salesperson <> Source.Salesperson
				OR Target.BTCompanyName <> Source.BTCompanyName
				OR Target.BTAddress1 <> Source.BTAddress1
				OR Target.BTAddress2 <> Source.BTAddress2
				OR Target.BTCity <> Source.BTCity
				OR Target.BTState <> Source.BTState
				OR Target.BTPostalCode <> Source.BTPostalCode
				OR Target.BTCountry <> Source.BTCountry
				OR Target.STCompanyName <> Source.STCompanyName
				OR Target.STAddress1 <> Source.STAddress1
				OR Target.STAddress2 <> Source.STAddress2
				OR Target.STCity <> Source.STCity
				OR Target.STState <> Source.STState
				OR Target.STPostalCode <> Source.STPostalCode
				OR Target.STCountry <> Source.STCountry
				OR Target.Notes <> Source.Notes
				OR Target.ProductTotal <> Source.ProductTotal
				OR Target.DiscountAmount <> Source.DiscountAmount
				OR Target.ShippingAndHandling <> Source.ShippingAndHandling
				OR Target.OtherCharges <> Source.OtherCharges
				OR Target.TaxAmount <> Source.TaxAmount
				OR Target.OrderTotal <> Source.OrderTotal
				OR ISNULL(Target.ConversionRate,0) <> ISNULL(Source.ConversionRate,0)
			) THEN
			UPDATE SET 
				Target.ERPOrderNumber = Source.ERPOrderNumber,
				Target.WebOrderNumber = Source.WebOrderNumber,
				Target.OrderDate = Source.OrderDate,
				Target.Status = Source.Status,
				Target.CustomerNumber = Source.CustomerNumber,
				Target.CustomerSequence = Source.CustomerSequence,
				Target.CustomerPO = Source.CustomerPO,
				Target.CurrencyCode = Source.CurrencyCode,
				Target.Terms = Source.Terms,
				Target.ShipCode = Source.ShipCode,
				Target.Salesperson = Source.Salesperson,
				Target.BTCompanyName = Source.BTCompanyName,
				Target.BTAddress1 = Source.BTAddress1,
				Target.BTAddress2 = Source.BTAddress2,
				Target.BTCity = Source.BTCity,
				Target.BTState = Source.BTState,
				Target.BTPostalCode = Source.BTPostalCode,
				Target.BTCountry = Source.BTCountry,
				Target.STCompanyName = Source.STCompanyName,
				Target.STAddress1 = Source.STAddress1,
				Target.STAddress2 = Source.STAddress2,
				Target.STCity = Source.STCity,
				Target.STState = Source.STState,
				Target.STPostalCode = Source.STPostalCode,
				Target.STCountry = Source.STCountry,
				Target.Notes = Source.Notes,
				Target.ProductTotal = Source.ProductTotal,
				Target.DiscountAmount = Source.DiscountAmount,
				Target.ShippingAndHandling = Source.ShippingAndHandling,
				Target.OtherCharges = Source.OtherCharges,
				Target.TaxAmount = Source.TaxAmount,
				Target.OrderTotal = Source.OrderTotal,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ConversionRate = Source.ConversionRate,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ERPOrderNumber,
			      WebOrderNumber,
			      OrderDate,
			      Status,
			      CustomerNumber,
			      CustomerSequence,
			      CustomerPO,
			      CurrencyCode,
			      Terms,
			      ShipCode,
			      Salesperson,
			      BTCompanyName,
			      BTAddress1,
			      BTAddress2,
			      BTCity,
			      BTState,
			      BTPostalCode,
			      BTCountry,
			      STCompanyName,
			      STAddress1,
			      STAddress2,
			      STCity,
			      STState,
			      STPostalCode,
			      STCountry,
			      Notes,
			      ProductTotal,
			      DiscountAmount,
			      ShippingAndHandling,
			      OtherCharges,
			      TaxAmount,
			      OrderTotal,
			      ModifiedOn,
			      ConversionRate,
			      CreatedOn,
			      CreatedBy,
			      ModifiedBy
				)
			VALUES
			(
			   Source.Id,
			   Source.ERPOrderNumber,
			   Source.WebOrderNumber,
			   Source.OrderDate,
			   Source.Status,
			   Source.CustomerNumber,
			   Source.CustomerSequence,
			   Source.CustomerPO,
			   Source.CurrencyCode,
			   Source.Terms,
			   Source.ShipCode,
			   Source.Salesperson,
			   Source.BTCompanyName,
			   Source.BTAddress1,
			   Source.BTAddress2,
			   Source.BTCity,
			   Source.BTState,
			   Source.BTPostalCode,
			   Source.BTCountry,
			   Source.STCompanyName,
			   Source.STAddress1,
			   Source.STAddress2,
			   Source.STCity,
			   Source.STState,
			   Source.STPostalCode,
			   Source.STCountry,
			   Source.Notes,
			   Source.ProductTotal,
			   Source.DiscountAmount,
			   Source.ShippingAndHandling,
			   Source.OtherCharges,
			   Source.TaxAmount,
			   Source.OrderTotal,
			   Source.ModifiedOn,
			   Source.ConversionRate,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedBy
			 )
			WHEN NOT MATCHED BY Source THEN
				DELETE;

			--==========================================================================================================
			-- Merge OrderHistoryLine
			--==========================================================================================================

			;MERGE [Insite.Morsco]..OrderHistoryLine AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..OrderHistoryLine AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.OrderHistoryId <> Source.OrderHistoryId
				OR ISNULL(Target.RequiredDate,'1/1/1900') <> ISNULL(Source.RequiredDate,'1/1/1900')
				OR ISNULL(Target.LastShipDate,'1/1/1900') <> ISNULL(Source.LastShipDate,'1/1/1900')
				OR Target.CustomerNumber <> Source.CustomerNumber
				OR Target.CustomerSequence <> Source.CustomerSequence
				OR Target.LineType <> Source.LineType
				OR Target.Status <> Source.Status
				OR Target.LineNumber <> Source.LineNumber
				OR Target.ReleaseNumber <> Source.ReleaseNumber
				OR Target.ProductERPNumber <> Source.ProductERPNumber
				OR Target.CustomerProductNumber <> Source.CustomerProductNumber
				OR Target.LinePOReference <> Source.LinePOReference
				OR Target.Description <> Source.Description
				OR Target.Warehouse <> Source.Warehouse
				OR Target.Notes <> Source.Notes
				OR Target.QtyOrdered <> Source.QtyOrdered
				OR Target.QtyShipped <> Source.QtyShipped
				OR Target.UnitOfMeasure <> Source.UnitOfMeasure
				OR Target.InventoryQtyOrdered <> Source.InventoryQtyOrdered
				OR Target.InventoryQtyShipped <> Source.InventoryQtyShipped
				OR Target.UnitPrice <> Source.UnitPrice
				OR Target.DiscountPercent <> Source.DiscountPercent
				OR Target.DiscountAmount <> Source.DiscountAmount
				OR Target.PromotionAmountApplied <> Source.PromotionAmountApplied
				OR Target.LineTotal <> Source.LineTotal
				OR Target.RMAQtyRequested <> Source.RMAQtyRequested
				OR Target.RMAQtyReceived <> Source.RMAQtyReceived
			) THEN
			UPDATE SET 
				Target.OrderHistoryId = Source.OrderHistoryId,
				Target.RequiredDate = Source.RequiredDate,
				Target.LastShipDate = Source.LastShipDate,
				Target.CustomerNumber = Source.CustomerNumber,
				Target.CustomerSequence = Source.CustomerSequence,
				Target.LineType = Source.LineType,
				Target.Status = Source.Status,
				Target.LineNumber = Source.LineNumber,
				Target.ReleaseNumber = Source.ReleaseNumber,
				Target.ProductERPNumber = Source.ProductERPNumber,
				Target.CustomerProductNumber = Source.CustomerProductNumber,
				Target.LinePOReference = Source.LinePOReference,
				Target.Description = Source.Description,
				Target.Warehouse = Source.Warehouse,
				Target.Notes = Source.Notes,
				Target.QtyOrdered = Source.QtyOrdered,
				Target.QtyShipped = Source.QtyShipped,
				Target.UnitOfMeasure = Source.UnitOfMeasure,
				Target.InventoryQtyOrdered = Source.InventoryQtyOrdered,
				Target.InventoryQtyShipped = Source.InventoryQtyShipped,
				Target.UnitPrice = Source.UnitPrice,
				Target.DiscountPercent = Source.DiscountPercent,
				Target.DiscountAmount = Source.DiscountAmount,
				Target.PromotionAmountApplied = Source.PromotionAmountApplied,
				Target.LineTotal = Source.LineTotal,
				Target.RMAQtyRequested = Source.RMAQtyRequested,
				Target.RMAQtyReceived = Source.RMAQtyReceived,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      OrderHistoryId,
			      RequiredDate,
			      LastShipDate,
			      CustomerNumber,
			      CustomerSequence,
			      LineType,
			      Status,
			      LineNumber,
			      ReleaseNumber,
			      ProductERPNumber,
			      CustomerProductNumber,
			      LinePOReference,
			      Description,
			      Warehouse,
			      Notes,
			      QtyOrdered,
			      QtyShipped,
			      UnitOfMeasure,
			      InventoryQtyOrdered,
			      InventoryQtyShipped,
			      UnitPrice,
			      DiscountPercent,
			      DiscountAmount,
			      PromotionAmountApplied,
			      LineTotal,
			      RMAQtyRequested,
			      RMAQtyReceived,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy
				)
			VALUES
			(
			   Source.Id,
			   Source.OrderHistoryId,
			   Source.RequiredDate,
			   Source.LastShipDate,
			   Source.CustomerNumber,
			   Source.CustomerSequence,
			   Source.LineType,
			   Source.Status,
			   Source.LineNumber,
			   Source.ReleaseNumber,
			   Source.ProductERPNumber,
			   Source.CustomerProductNumber,
			   Source.LinePOReference,
			   Source.Description,
			   Source.Warehouse,
			   Source.Notes,
			   Source.QtyOrdered,
			   Source.QtyShipped,
			   Source.UnitOfMeasure,
			   Source.InventoryQtyOrdered,
			   Source.InventoryQtyShipped,
			   Source.UnitPrice,
			   Source.DiscountPercent,
			   Source.DiscountAmount,
			   Source.PromotionAmountApplied,
			   Source.LineTotal,
			   Source.RMAQtyRequested,
			   Source.RMAQtyReceived,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy
			 )
		WHEN NOT MATCHED BY Source THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END