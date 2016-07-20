CREATE PROCEDURE [dbo].[sp_PopulateETLShipments]
--
-- Name:	sp_PopulateETLShipments
-- Descr:	Populate all Shipment tables
-- Created:	7/28/2015 Matt Glover XCentium
-- Altered:
-- Test With: exec sp_PopulateETLShipments 'EXP', 'ServiceUser'
(
	@EtlSourceID VARCHAR(5),
	@User VARCHAR(100)
)
AS 
BEGIN
	SET NOCOUNT ON;
	
	DECLARE @ErrorMessage VARCHAR(100);
	DECLARE @SentinelDate DATETIME2 = '0001-01-01'


	-- Turn off foreign key constraints so we can truncate
	ALTER TABLE ShipmentPackageLine NOCHECK CONSTRAINT all
	ALTER TABLE ShipmentPackage NOCHECK CONSTRAINT all
	ALTER TABLE Shipment NOCHECK CONSTRAINT all
	
	--If we can truncate, they're not logged, so transaction should not help
	TRUNCATE TABLE ShipmentPackageLine;
	DELETE ShipmentPackage;
	DELETE Shipment;

	-- Turn ON foreign key constraints so we can truncate
	ALTER TABLE ShipmentPackageLine CHECK CONSTRAINT all
	ALTER TABLE ShipmentPackage CHECK CONSTRAINT all
	ALTER TABLE Shipment CHECK CONSTRAINT all
	
	--TODO: THere are vw_allsalesledgerheaders that have dupe erporderno/genid/gen -- what do we do about these.

	BEGIN TRY
		BEGIN TRANSACTION

			--==========================================================================================================
			-- Insert Shipment
			--==========================================================================================================
			INSERT Shipment			--TODO: Believe shipmentnumber is not unique for some reason.
			   (
			   --[Id],
			   [ShipmentNumber]
			   ,[ShipmentDate]
			   ,[EmailSentDate]
			   ,[ASNSentDate]
			   ,[WebOrderNumber]
			   ,[ERPOrderNumber]
			   ,[CreatedOn]
			   ,[CreatedBy]
			   ,[ModifiedOn]
			   ,[ModifiedBy])
			SELECT
				dbo.fn_GetShipmentId(H.ErpOrderNo, H.GenId, H.Gen) ShipmentNumber,
				-- ShipDate is not nullable -- we'll have to do a sentinel ship date 
				MAX(COALESCE(H.ShipDate, @SentinelDate)) [ShipmentDate],
				NULL [EmailSentDate],
			    NULL [ASNSentDate],
			    '' [WebOrderNumber],					--TODO: This must be set.
			    MAX(H.ErpOrderNo) [ERPOrderNumber],
			    GETDATE() [CreatedOn],
			    @User [CreatedBy],
			    GETDATE() [ModifiedOn],
			    @User [ModifiedBy]
			FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H
			WHERE H.ETLSourceID = @EtlSourceId
			AND H.ErpOrderNo IS NOT NULL
			GROUP BY dbo.fn_GetShipmentId(H.ErpOrderNo, H.GenId, H.Gen)

			-- Get the IDs to be used in Merging
			UPDATE New
				SET New.ID = Existing.ID
			FROM Shipment New
			JOIN [Insite.ExpressPipe]..Shipment Existing ON Existing.ShipmentNumber = New.ShipmentNumber

			--==========================================================================================================
			-- Insert ShipmentPackage
			--==========================================================================================================
			-- We're creating one shipment package per shipment.
			INSERT ShipmentPackage
				(
			    --[Id],
				[ShipmentId],
				[Carrier],
				[TrackingNumber],
			    [Freight],
			    [PackageNumber],
			    [ShipVia],
			    [CreatedOn],
			    [CreatedBy],
			    [ModifiedOn],
			    [ModifiedBy])
			SELECT 
				S.Id,
				'' [Carrier],
				'' [TrackingNumber],
			    0 [Freight],
			    1 [PackageNumber],
			    '' [ShipVia],
				GETDATE() [CreatedOn],
			    @User [CreatedBy],
			    GETDATE() [ModifiedOn],
			    @User [ModifiedBy]
			FROM Shipment S (NOLOCK)

			-- Get the IDs to be used in Merging
			UPDATE New
				SET New.ID = Existing.ID
			FROM ShipmentPackage New
			JOIN [Insite.ExpressPipe]..ShipmentPackage Existing ON Existing.ShipmentId = New.ShipmentId

			--==========================================================================================================
			-- Insert ShipmentPackageLine
			--==========================================================================================================
			INSERT INTO [dbo].[ShipmentPackageLine]
			   (
			   -- [Id],
			   [ShipmentPackageId]
			   ,[ProductName]
			   ,[ProductDescription]
			   ,[ProductCode]
			   ,[QtyOrdered]
			   ,[QtyShipped]
			   ,[Price]
			   ,[OrderLineId]
			   ,[CreatedOn]
			   ,[CreatedBy]
			   ,[ModifiedOn]
			   ,[ModifiedBy]
			   )
			SELECT 
				SP.ID [ShipmentPackageId],
				-- Have to truncate PartName some are over 1700 chars long and ERPPartName is 100)
				SUBSTRING(MAX(ISNULL(L.ERPPartName, '')),1,100) [ProductName],
				'' ProductDescription,
				-- NOTE: Need to be able to locate this data in order to update.  We're rolling up by partno and line number for this purpose.  
				--       Store them in Product Code
				ISNULL(L.ERPPartNo,'') + '.' + ISNULL(L.LineNum,'') ProductCode,
				SUM(ISNULL(L.OrderQuantity, 0)) QtyOrdered,
				SUM(CASE WHEN H.ShipDate IS NOT NULL THEN L.OrderQuantity ELSE 0 END) [QuantityShipped],
				MAX(ISNULL(L.UnitPrice, 0)) [Price],
				MAX(OL.ID) [OrderLineId],
				GETDATE() [CreatedOn],
			    @User [CreatedBy],
			    GETDATE() [ModifiedOn],
			    @User [ModifiedBy]
			FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H
			JOIN DM_ECommerce.dbo.LedgerLineItem L (NOLOCK) ON L.EtlSourceID = H.EtlSourceId
										  AND L.ERPOrderNo = H.ERPOrderNo
										  AND ISNULL(L.Gen,'') = ISNULL(H.Gen,'')
										  AND ISNULL(L.GenId,'') = ISNULL(H.GenId,'')
			JOIN OrderHistory O ON O.ErpOrderNumber = H.ErpOrderNo
			-- OrderLine is one per order number, part number
			JOIN OrderHistoryLine OL ON OL.OrderHistoryId = O.Id
			                        AND OL.ProductErpNumber = L.ERPPartNo
			JOIN Shipment S ON S.ShipmentNumber = dbo.fn_GetShipmentId(H.ErpOrderNo, H.GenId, H.Gen)
			JOIN ShipmentPackage SP ON SP.ShipmentId = S.ID
			WHERE H.ETLSourceID = 'EXP'
			AND L.ERPPartNo IS NOT NULL
			GROUP BY SP.ID, H.ERPOrderNo, H.GenId, H.Gen, L.ERPPartNo, L.LineNum

			-- Get the IDs to be used in Merging
			UPDATE New
				SET New.ID = Existing.ID
			FROM ShipmentPackageLine New
			JOIN [Insite.ExpressPipe]..ShipmentPackageLine Existing ON Existing.ShipmentPackageId = New.ShipmentPackageId
			                                                       AND Existing.ProductCode = New.ProductCode

		COMMIT TRANSACTION;
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK
	END Catch;
END