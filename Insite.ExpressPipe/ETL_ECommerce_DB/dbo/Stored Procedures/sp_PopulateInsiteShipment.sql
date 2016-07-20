CREATE PROCEDURE [dbo].[sp_PopulateInsiteShipment]
--
-- Name:	sp_PopulateInsiteShipment
-- Descr:	sp_PopulateInsiteShipment, ShipmentPackage, ShipmentPackageLine
-- Created:	7/28/2015 Matt Glover XCentium
-- Altered:
-- NOTE:  ETL for Shipment must have been populated before running this
-- Test With: EXEC sp_PopulateInsiteShipment 'EXP', 'ServiceUser'
--
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION
			
			--==========================================================================================================
			-- Merge Shipment
			--==========================================================================================================

			;MERGE [Insite.ExpressPipe]..Shipment AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Shipment AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.ShipmentNumber <> Source.ShipmentNumber
				OR Target.ShipmentDate <> Source.ShipmentDate
				OR Target.EmailSentDate <> Source.EmailSentDate
				OR Target.ASNSentDate <> Source.ASNSentDate
				OR Target.WebOrderNumber <> Source.WebOrderNumber
				OR Target.ERPOrderNumber <> Source.ERPOrderNumber
			) THEN
			UPDATE SET 
				Target.ShipmentNumber = Source.ShipmentNumber,
				Target.ShipmentDate = Source.ShipmentDate,
				Target.EmailSentDate = Source.EmailSentDate,
				Target.ASNSentDate = Source.ASNSentDate,
				Target.WebOrderNumber = Source.WebOrderNumber,
				Target.ERPOrderNumber = Source.ERPOrderNumber,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ShipmentNumber,
			      ShipmentDate,
			      EmailSentDate,
			      ASNSentDate,
			      WebOrderNumber,
			      ERPOrderNumber,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy
				)
			VALUES
			(
			   Source.Id,
			   Source.ShipmentNumber,
			   Source.ShipmentDate,
			   Source.EmailSentDate,
			   Source.ASNSentDate,
			   Source.WebOrderNumber,
			   Source.ERPOrderNumber,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy
			)
			WHEN NOT MATCHED BY Source THEN
			DELETE;

			--==========================================================================================================
			-- Merge ShipmentPackage
			--==========================================================================================================
			;MERGE [Insite.ExpressPipe]..ShipmentPackage AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ShipmentPackage AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.ShipmentId <> Source.ShipmentId
				OR Target.Carrier <> Source.Carrier
				OR Target.TrackingNumber <> Source.TrackingNumber
				OR Target.Freight <> Source.Freight
				OR Target.PackageNumber <> Source.PackageNumber
				OR Target.ShipVia <> Source.ShipVia
			) THEN
			UPDATE SET 
				Target.ShipmentId = Source.ShipmentId,
				Target.Carrier = Source.Carrier,
				Target.TrackingNumber = Source.TrackingNumber,
				Target.Freight = Source.Freight,
				Target.PackageNumber = Source.PackageNumber,
				Target.ShipVia = Source.ShipVia,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ShipmentId,
			      Carrier,
			      TrackingNumber,
			      Freight,
			      PackageNumber,
			      ShipVia,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy
				)
			VALUES
				(
				   Source.Id,
				   Source.ShipmentId,
				   Source.Carrier,
				   Source.TrackingNumber,
				   Source.Freight,
				   Source.PackageNumber,
				   Source.ShipVia,
				   Source.CreatedOn,
				   Source.CreatedBy,
				   Source.ModifiedOn,
				   Source.ModifiedBy
				)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

			--==========================================================================================================
			-- Merge ShipmentPackage
			--==========================================================================================================
			;MERGE [Insite.ExpressPipe]..ShipmentPackageLine AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ShipmentPackageLine AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.ShipmentPackageId <> Source.ShipmentPackageId
				OR Target.ProductName <> Source.ProductName
				OR Target.ProductDescription <> Source.ProductDescription
				OR Target.ProductCode <> Source.ProductCode
				OR Target.QtyOrdered <> Source.QtyOrdered
				OR Target.QtyShipped <> Source.QtyShipped
				OR Target.Price <> Source.Price
				OR Target.OrderLineId <> Source.OrderLineId
			) THEN
			UPDATE SET 
				Target.ShipmentPackageId = Source.ShipmentPackageId,
				Target.ProductName = Source.ProductName,
				Target.ProductDescription = Source.ProductDescription,
				Target.ProductCode = Source.ProductCode,
				Target.QtyOrdered = Source.QtyOrdered,
				Target.QtyShipped = Source.QtyShipped,
				Target.Price = Source.Price,
				Target.OrderLineId = Source.OrderLineId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ShipmentPackageId,
			      ProductName,
			      ProductDescription,
			      ProductCode,
			      QtyOrdered,
			      QtyShipped,
			      Price,
			      OrderLineId,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy
				)
			VALUES
				(
				   Source.Id,
				   Source.ShipmentPackageId,
				   Source.ProductName,
				   Source.ProductDescription,
				   Source.ProductCode,
				   Source.QtyOrdered,
				   Source.QtyShipped,
				   Source.Price,
				   Source.OrderLineId,
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