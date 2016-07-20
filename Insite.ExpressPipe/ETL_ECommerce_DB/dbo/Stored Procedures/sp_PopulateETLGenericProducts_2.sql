
CREATE PROCEDURE [dbo].[sp_PopulateETLGenericProducts]
(
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE GenericProducts AS Target
			USING
			(
				SELECT * FROM GenericProducts_Scrub AS Source
			) AS Source
			ON Target.CustomerItemId = Source.[CUSTOMER_Item ID]
		WHEN MATCHED AND 
			(
				Target.CustomerItemId <> Source.[CUSTOMER_Item ID]
				OR Target.CustomerDescription <> Source.[CUSTOMER_Description]
				OR Target.CustomerManufacturerPartNumber <> Source.[CUSTOMER_Manufacturer Part Number]
				OR Target.ManufacturerName <> Source.[MANUFACTURER NAME]
				OR Target.IsGenericProduct <> Source.[Generic (Y/N)]
				OR Target.GenericSKU <> Source.[Generic SKU #]
				OR Target.XrefSKU <> Source.[XREF SKU]
				OR Target.GenericProductFamilyCode <> Source.[Generic Product Family Code]
				OR Target.DisplayOrder <> Source.[Display Order]
				OR Target.VariantDimension <> Source.[Variant Dimension]
				OR Target.ValueOfVariant <> Source.[Value of Variant]
			) THEN
			UPDATE SET 
				Target.CustomerItemId = Source.[CUSTOMER_Item ID],
				Target.CustomerDescription = Source.[CUSTOMER_Description],
				Target.CustomerManufacturerPartNumber = Source.[CUSTOMER_Manufacturer Part Number],
				Target.ManufacturerName = Source.[MANUFACTURER NAME],
				Target.IsGenericProduct = Source.[Generic (Y/N)],
				Target.GenericSKU = Source.[Generic SKU #],
				Target.XrefSKU = Source.[XREF SKU],
				Target.GenericProductFamilyCode = Source.[Generic Product Family Code],
				Target.DisplayOrder = Source.[Display Order],
				Target.VariantDimension = Source.[Variant Dimension],
				Target.ValueOfVariant = Source.[Value of Variant],
				Target.ModifiedOn = GETDATE(),
				Target.ModifiedBy = @UserName
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      CustomerItemId,
			      CustomerDescription,
			      CustomerManufacturerPartNumber,
			      ManufacturerName,
			      IsGenericProduct,
			      GenericSKU,
			      XrefSKU,
			      GenericProductFamilyCode,
			      DisplayOrder,
			      VariantDimension,
			      ValueOfVariant,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			  NEWID()
			   ,Source.[CUSTOMER_Item ID]
			   ,Source.[CUSTOMER_Description]
			   ,Source.[CUSTOMER_Manufacturer Part Number]
			   ,Source.[MANUFACTURER NAME]
			   ,Source.[Generic (Y/N)]
			   ,Source.[Generic SKU #]
			   ,Source.[XREF SKU]
			   ,Source.[Generic Product Family Code]
			   ,Source.[Display Order]
			   ,Source.[Variant Dimension]
			   ,Source.[Value of Variant]
			   ,GETDATE() 
			   ,@UserName 
			   ,GETDATE() 
			   ,@UserName 			)
		--WHEN NOT MATCHED BY Source THEN
		--	DELETE
			;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END