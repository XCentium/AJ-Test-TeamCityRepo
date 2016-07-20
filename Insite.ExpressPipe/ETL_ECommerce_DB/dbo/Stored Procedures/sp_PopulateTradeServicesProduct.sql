CREATE PROCEDURE [dbo].[sp_PopulateTradeServicesProduct]
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE [ETL_Ecommerce]..TradeServicesProduct AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..TradeServicesProduct_RawData AS Source
			) AS Source
			ON Target.CustomerItemId = Source.[CUSTOMER_Item ID]
		WHEN MATCHED AND 
			(
				Target.CustomerManufacturerName <> Source.[CUSTOMER_Manufacturer Name]
				OR Target.CustomerManufacturerPartNumber <> Source.[CUSTOMER_Manufacturer Part Number]
				OR Target.CustomerDescription <> Source.[CUSTOMER_Description]
				OR Target.CustomerUPC <> Source.[CUSTOMER_UPC]
				OR Target.CustomerPriceLine <> Source.[CUSTOMER_Price Line]
				OR Target.ManufacturerName <> Source.[MANUFACTURER NAME]
				OR Target.ManufacturerPartNumber <> Source.[Manufacturer Part Number]
				OR Target.ShortDescription <> Source.[Short Description]
				OR Target.ProductName <> Source.[Product Name]
				OR Target.BrandSERIESName <> Source.[Brand SERIES Name]
				OR Target.UPC <> Source.[UPC ]
				OR Target.UnspscCode <> Source.[Unspsc Code]
				OR Target.TsSchemaParentClassName <> Source.[Ts Schema Parent Class Name]
				OR Target.TsSchemaLeafClassName <> Source.[Ts Schema Leaf Class Name]
				OR Target.AttributeName1 <> Source.[Attribute Name_1]
				OR Target.AttributeValue1 <> Source.[Attribute Value_1]
				OR Target.AttributeName2 <> Source.[Attribute Name_2]
				OR Target.AttributeValue2 <> Source.[Attribute Value_2]
				OR Target.AttributeName3 <> Source.[Attribute Name_3]
				OR Target.AttributeValue3 <> Source.[Attribute Value_3]
				OR Target.AttributeName4 <> Source.[Attribute Name_4]
				OR Target.AttributeValue4 <> Source.[Attribute Value_4]
				OR Target.AttributeName5 <> Source.[Attribute Name_5]
				OR Target.AttributeValue5 <> Source.[Attribute Value_5]
				OR Target.AttributeName6 <> Source.[Attribute Name_6]
				OR Target.AttributeValue6 <> Source.[Attribute Value_6]
				OR Target.AttributeName7 <> Source.[Attribute Name_7]
				OR Target.AttributeValue7 <> Source.[Attribute Value_7]
				OR Target.AttributeName8 <> Source.[Attribute Name_8]
				OR Target.AttributeValue8 <> Source.[Attribute Value_8]
				OR Target.AttributeName9 <> Source.[Attribute Name_9]
				OR Target.AttributeValue9 <> Source.[Attribute Value_9]
				OR Target.AttributeName10 <> Source.[Attribute Name_10]
				OR Target.AttributeValue10 <> Source.[Attribute Value_10]
				OR Target.AttributeName11 <> Source.[Attribute Name_11]
				OR Target.AttributeValue11 <> Source.[Attribute Value_11]
				OR Target.AttributeName12 <> Source.[Attribute Name_12]
				OR Target.AttributeValue12 <> Source.[Attribute Value_12]
				OR Target.AttributeName13 <> Source.[Attribute Name_13]
				OR Target.AttributeValue13 <> Source.[Attribute Value_13]
				OR Target.AttributeName14 <> Source.[Attribute Name_14]
				OR Target.AttributeValue14 <> Source.[Attribute Value_14]
				OR Target.AttributeName15 <> Source.[Attribute Name_15]
				OR Target.AttributeValue15 <> Source.[Attribute Value_15]
				OR Target.AttributeName16 <> Source.[Attribute Name_16]
				OR Target.AttributeValue16 <> Source.[Attribute Value_16]
				OR Target.AttributeName17 <> Source.[Attribute Name_17]
				OR Target.AttributeValue17 <> Source.[Attribute Value_17]
				OR Target.AttributeName18 <> Source.[Attribute Name_18]
				OR Target.AttributeValue18 <> Source.[Attribute Value_18]
				OR Target.AttributeName19 <> Source.[Attribute Name_19]
				OR Target.AttributeValue19 <> Source.[Attribute Value_19]
				OR Target.AttributeName20 <> Source.[Attribute Name_20]
				OR Target.AttributeValue20 <> Source.[Attribute Value_20]
				OR Target.AttributeName21 <> Source.[Attribute Name_21]
				OR Target.AttributeValue21 <> Source.[Attribute Value_21]
				OR Target.AttributeName22 <> Source.[Attribute Name_22]
				OR Target.AttributeValue22 <> Source.[Attribute Value_22]
				OR Target.AdditionalInformation <> Source.[ADDITONAL INFORMATION]
				OR Target.LongDescription <> Source.[ LONG DESCRIPTION]
				OR Target.FeaturesBenefits <> Source.[FEATURES BENEFITS]
				OR Target.PackageWeight <> Source.[PACKAGE WEIGHT  (pounds)]
				OR Target.PackageWidth <> Source.[PACKAGE WIDTH  (inch)]
				OR Target.PackageLength <> Source.[PACKAGE LENGTH  (inch)]
				OR Target.PackageHeight <> Source.[PACKAGE HEIGHT  (inch)]
				OR Target.PackageVolume <> Source.[PACKAGE VOLUME  (cubic inch)]
				OR Target.CountryOfOrigin <> Source.[COUNTRY OF ORIGIN]
				OR Target.LeadFree <> Source.[LEAD FREE  (Yes or No)]
				OR Target.MercuryFree <> Source.[MERCURY FREE  (Yes or No)]
				OR Target.WaterSenseSaver <> Source.[WATER SENSE SAVER  (Yes or No)]
				OR Target.EnergyStarRated <> Source.[ENERGY STAR RATED  (Yes or No)]
				OR Target.StandardImage <> Source.[IMAGE  (Standard)]
				OR Target.MfrCatalogDOcument <> Source.[MFR CATALOG DOCUMENT]
				OR Target.MfrSpecificationTechnicalDocument <> Source.[MFR SPECIFICATION TECHNICAL DOCUMENT]
				OR Target.MfrMsdsDocument <> Source.[MFR MSDS DOCUMENT]
				OR Target.MfrInstallationOperatorDocument <> Source.[MFR INSTALLATION OPERATOR  DOCUMENT]
				OR Target.TsStatus <> Source.[TS_STATUS]
				OR Target.TsCommentsForCustomer <> Source.[TS_COMMENTS FOR CUSTOMER]
				OR Target.MfrItemPage <> Source.[ADDITIONAL URL_1  (Mfr Item Page)]
				OR Target.AdditionalUrl2 <> Source.[ADDITIONAL URL_2]
			) THEN
			UPDATE SET 
				Target.CustomerManufacturerName = Source.[CUSTOMER_Manufacturer Name],
				Target.CustomerManufacturerPartNumber = Source.[CUSTOMER_Manufacturer Part Number],
				Target.CustomerDescription = Source.[CUSTOMER_Description],
				Target.CustomerUPC = Source.[CUSTOMER_UPC],
				Target.CustomerPriceLine = Source.[CUSTOMER_Price Line],
				Target.ManufacturerName = Source.[MANUFACTURER NAME],
				Target.ManufacturerPartNumber = Source.[Manufacturer Part Number],
				Target.ShortDescription = Source.[Short Description],
				Target.ProductName = Source.[Product Name],
				Target.BrandSERIESName = Source.[Brand SERIES Name],
				Target.UPC = Source.[UPC ],
				Target.UnspscCode = Source.[Unspsc Code],
				Target.TsSchemaParentClassName = Source.[Ts Schema Parent Class Name],
				Target.TsSchemaLeafClassName = Source.[Ts Schema Leaf Class Name],
				Target.AttributeName1 = Source.[Attribute Name_1],
				Target.AttributeValue1 = Source.[Attribute Value_1],
				Target.AttributeName2 = Source.[Attribute Name_2],
				Target.AttributeValue2 = Source.[Attribute Value_2],
				Target.AttributeName3 = Source.[Attribute Name_3],
				Target.AttributeValue3 = Source.[Attribute Value_3],
				Target.AttributeName4 = Source.[Attribute Name_4],
				Target.AttributeValue4 = Source.[Attribute Value_4],
				Target.AttributeName5 = Source.[Attribute Name_5],
				Target.AttributeValue5 = Source.[Attribute Value_5],
				Target.AttributeName6 = Source.[Attribute Name_6],
				Target.AttributeValue6 = Source.[Attribute Value_6],
				Target.AttributeName7 = Source.[Attribute Name_7],
				Target.AttributeValue7 = Source.[Attribute Value_7],
				Target.AttributeName8 = Source.[Attribute Name_8],
				Target.AttributeValue8 = Source.[Attribute Value_8],
				Target.AttributeName9 = Source.[Attribute Name_9],
				Target.AttributeValue9 = Source.[Attribute Value_9],
				Target.AttributeName10 = Source.[Attribute Name_10],
				Target.AttributeValue10 = Source.[Attribute Value_10],
				Target.AttributeName11 = Source.[Attribute Name_11],
				Target.AttributeValue11 = Source.[Attribute Value_11],
				Target.AttributeName12 = Source.[Attribute Name_12],
				Target.AttributeValue12 = Source.[Attribute Value_12],
				Target.AttributeName13 = Source.[Attribute Name_13],
				Target.AttributeValue13 = Source.[Attribute Value_13],
				Target.AttributeName14 = Source.[Attribute Name_14],
				Target.AttributeValue14 = Source.[Attribute Value_14],
				Target.AttributeName15 = Source.[Attribute Name_15],
				Target.AttributeValue15 = Source.[Attribute Value_15],
				Target.AttributeName16 = Source.[Attribute Name_16],
				Target.AttributeValue16 = Source.[Attribute Value_16],
				Target.AttributeName17 = Source.[Attribute Name_17],
				Target.AttributeValue17 = Source.[Attribute Value_17],
				Target.AttributeName18 = Source.[Attribute Name_18],
				Target.AttributeValue18 = Source.[Attribute Value_18],
				Target.AttributeName19 = Source.[Attribute Name_19],
				Target.AttributeValue19 = Source.[Attribute Value_19],
				Target.AttributeName20 = Source.[Attribute Name_20],
				Target.AttributeValue20 = Source.[Attribute Value_20],
				Target.AttributeName21 = Source.[Attribute Name_21],
				Target.AttributeValue21 = Source.[Attribute Value_21],
				Target.AttributeName22 = Source.[Attribute Name_22],
				Target.AttributeValue22 = Source.[Attribute Value_22],
				Target.AdditionalInformation = Source.[ADDITONAL INFORMATION],
				Target.LongDescription = Source.[ LONG DESCRIPTION],
				Target.FeaturesBenefits = Source.[FEATURES BENEFITS],
				Target.PackageWeight = Source.[PACKAGE WEIGHT  (pounds)],
				Target.PackageWidth = Source.[PACKAGE WIDTH  (inch)],
				Target.PackageLength = Source.[PACKAGE LENGTH  (inch)],
				Target.PackageHeight = Source.[PACKAGE HEIGHT  (inch)],
				Target.PackageVolume = Source.[PACKAGE VOLUME  (cubic inch)],
				Target.CountryOfOrigin = Source.[COUNTRY OF ORIGIN],
				Target.LeadFree = Source.[LEAD FREE  (Yes or No)],
				Target.MercuryFree = Source.[MERCURY FREE  (Yes or No)],
				Target.WaterSenseSaver = Source.[WATER SENSE SAVER  (Yes or No)],
				Target.EnergyStarRated = Source.[ENERGY STAR RATED  (Yes or No)],
				Target.StandardImage = Source.[IMAGE  (Standard)],
				Target.MfrCatalogDOcument = Source.[MFR CATALOG DOCUMENT],
				Target.MfrSpecificationTechnicalDocument = Source.[MFR SPECIFICATION TECHNICAL DOCUMENT],
				Target.MfrMsdsDocument = Source.[MFR MSDS DOCUMENT],
				Target.MfrInstallationOperatorDocument = Source.[MFR INSTALLATION OPERATOR  DOCUMENT],
				Target.TsStatus = Source.[TS_STATUS],
				Target.TsCommentsForCustomer = Source.[TS_COMMENTS FOR CUSTOMER],
				Target.MfrItemPage = Source.[ADDITIONAL URL_1  (Mfr Item Page)],
				Target.AdditionalUrl2 = Source.[ADDITIONAL URL_2]
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      CustomerItemID,
			      CustomerManufacturerName,
			      CustomerManufacturerPartNumber,
			      CustomerDescription,
			      CustomerUPC,
			      CustomerPriceLine,
			      ManufacturerName,
			      ManufacturerPartNumber,
			      ShortDescription,
			      ProductName,
			      BrandSERIESName,
			      UPC,
			      UnspscCode,
			      TsSchemaParentClassName,
			      TsSchemaLeafClassName,
			      AttributeName1,
			      AttributeValue1,
			      AttributeName2,
			      AttributeValue2,
			      AttributeName3,
			      AttributeValue3,
			      AttributeName4,
			      AttributeValue4,
			      AttributeName5,
			      AttributeValue5,
			      AttributeName6,
			      AttributeValue6,
			      AttributeName7,
			      AttributeValue7,
			      AttributeName8,
			      AttributeValue8,
			      AttributeName9,
			      AttributeValue9,
			      AttributeName10,
			      AttributeValue10,
			      AttributeName11,
			      AttributeValue11,
			      AttributeName12,
			      AttributeValue12,
			      AttributeName13,
			      AttributeValue13,
			      AttributeName14,
			      AttributeValue14,
			      AttributeName15,
			      AttributeValue15,
			      AttributeName16,
			      AttributeValue16,
			      AttributeName17,
			      AttributeValue17,
			      AttributeName18,
			      AttributeValue18,
			      AttributeName19,
			      AttributeValue19,
			      AttributeName20,
			      AttributeValue20,
			      AttributeName21,
			      AttributeValue21,
			      AttributeName22,
			      AttributeValue22,
			      AdditionalInformation,
			      LongDescription,
			      FeaturesBenefits,
			      PackageWeight,
			      PackageWidth,
			      PackageLength,
			      PackageHeight,
			      PackageVolume,
			      CountryOfOrigin,
			      LeadFree,
			      MercuryFree,
			      WaterSenseSaver,
			      EnergyStarRated,
			      StandardImage,
			      MfrCatalogDOcument,
			      MfrSpecificationTechnicalDocument,
			      MfrMsdsDocument,
			      MfrInstallationOperatorDocument,
			      TsStatus,
			      TsCommentsForCustomer,
			      MfrItemPage,
			      AdditionalUrl2				)
			VALUES
			(
			   Source.[CUSTOMER_Item ID],
			   Source.[CUSTOMER_Manufacturer Name],
			   Source.[CUSTOMER_Manufacturer Part Number],
			   Source.[CUSTOMER_Description],
			   Source.[CUSTOMER_UPC],
			   Source.[CUSTOMER_Price Line],
			   Source.[MANUFACTURER NAME],
			   Source.[Manufacturer Part Number],
			   Source.[Short Description],
			   Source.[Product Name],
			   Source.[Brand SERIES Name],
			   Source.[UPC ],
			   Source.[Unspsc Code],
			   Source.[Ts Schema Parent Class Name],
			   Source.[Ts Schema Leaf Class Name],
			   Source.[Attribute Name_1],
			   Source.[Attribute Value_1],
			   Source.[Attribute Name_2],
			   Source.[Attribute Value_2],
			   Source.[Attribute Name_3],
			   Source.[Attribute Value_3],
			   Source.[Attribute Name_4],
			   Source.[Attribute Value_4],
			   Source.[Attribute Name_5],
			   Source.[Attribute Value_5],
			   Source.[Attribute Name_6],
			   Source.[Attribute Value_6],
			   Source.[Attribute Name_7],
			   Source.[Attribute Value_7],
			   Source.[Attribute Name_8],
			   Source.[Attribute Value_8],
			   Source.[Attribute Name_9],
			   Source.[Attribute Value_9],
			   Source.[Attribute Name_10],
			   Source.[Attribute Value_10],
			   Source.[Attribute Name_11],
			   Source.[Attribute Value_11],
			   Source.[Attribute Name_12],
			   Source.[Attribute Value_12],
			   Source.[Attribute Name_13],
			   Source.[Attribute Value_13],
			   Source.[Attribute Name_14],
			   Source.[Attribute Value_14],
			   Source.[Attribute Name_15],
			   Source.[Attribute Value_15],
			   Source.[Attribute Name_16],
			   Source.[Attribute Value_16],
			   Source.[Attribute Name_17],
			   Source.[Attribute Value_17],
			   Source.[Attribute Name_18],
			   Source.[Attribute Value_18],
			   Source.[Attribute Name_19],
			   Source.[Attribute Value_19],
			   Source.[Attribute Name_20],
			   Source.[Attribute Value_20],
			   Source.[Attribute Name_21],
			   Source.[Attribute Value_21],
			   Source.[Attribute Name_22],
			   Source.[Attribute Value_22],
			   Source.[ADDITONAL INFORMATION],
			   Source.[ Long Description],
			   Source.[Features Benefits],
			   Source.[PACKAGE WEIGHT  (pounds)],
			   Source.[PACKAGE WIDTH  (inch)],
			   Source.[PACKAGE LENGTH  (inch)],
			   Source.[PACKAGE HEIGHT  (inch)],
			   Source.[PACKAGE VOLUME  (cubic inch)],
			   Source.[Country Of Origin],
			   Source.[LEAD FREE  (Yes or No)],
			   Source.[MERCURY FREE  (Yes or No)],
			   Source.[WATER SENSE SAVER  (Yes or No)],
			   Source.[ENERGY STAR RATED  (Yes or No)],
			   Source.[IMAGE  (Standard)],
			   Source.[Mfr Catalog DOcument],
			   Source.[Mfr Specification Technical Document],
			   Source.[Mfr Msds Document],
			   Source.[MFR INSTALLATION OPERATOR  DOCUMENT],
			   Source.[Ts_Status],
			   Source.[Ts_Comments For Customer],
			   Source.[ADDITIONAL URL_1  (Mfr Item Page)],
			   Source.[Additional Url_2]			)
		--WHEN NOT MATCHED BY SOURCE THEN		 --TODO COMMENTED TEMPORARILY
			   --DELETE;   --TODO COMMENTED TEMPORARILY 
			   ;
		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@trancount > 0 ROLLBACK TRANSACTION
		--Oh!! some error occured and keeping this information here.
		EXECUTE [dbo].[sp_LogError] -- Log the error details in the ErrorLog table.
		DECLARE @msg nvarchar(2048) = error_message()  
		RAISERROR (@msg, 16, 1)
		RETURN 55555
	END Catch;

END