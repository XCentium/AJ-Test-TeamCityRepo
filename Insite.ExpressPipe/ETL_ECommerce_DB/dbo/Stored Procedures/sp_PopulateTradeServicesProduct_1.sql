
CREATE PROCEDURE [dbo].[sp_PopulateTradeServicesProduct]
--*****************************************************************************************************************
-- Name:	[sp_PopulateTradeServicesProduct]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateTradeServicesProduct] 'EXP', 'ServiceUser', 'InsiteCommerce'
--*****************************************************************************************************************
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	SET XACT_ABORT ON;

	-- Temp table to have varchar values of all source
	IF OBJECT_ID('tempdb..#Scrub') IS NOT NULL
	BEGIN
		DROP TABLE #Scrub
	END

	SELECT 
		CAST(Source.[TS_ID] AS VARCHAR(255)) [TS_ID],
		CAST(Source.[CUSTOMER_Item ID] AS VARCHAR(255)) [CUSTOMER_Item ID],
		CAST(Source.[CUSTOMER_Manufacturer Name] AS VARCHAR(255)) [CUSTOMER_Manufacturer Name],
		CAST(Source.[CUSTOMER_Manufacturer Part Number] AS VARCHAR(255)) [CUSTOMER_Manufacturer Part Number],
		CAST(Source.[CUSTOMER_Description] AS VARCHAR(255)) [CUSTOMER_Description],
		CAST(Source.[CUSTOMER_UPC] AS VARCHAR(255)) [CUSTOMER_UPC],
		CAST(Source.[CUSTOMER_Price Line] AS VARCHAR(255)) [CUSTOMER_Price Line],
		CAST(Source.[CUSTOMER_P C] AS VARCHAR(255)) [CUSTOMER_P C],
		CAST(Source.[CUSTOMER_Status] AS VARCHAR(255)) [CUSTOMER_Status],
		CAST(Source.[CUSTOMER_Sell Group] AS VARCHAR(255)) [CUSTOMER_Sell Group],
		CAST(Source.[COMMODITY GENERIC (Yes or No)] AS VARCHAR(255)) [COMMODITY GENERIC (Yes or No)],
		CAST(Source.[MANUFACTURER NAME] AS VARCHAR(255)) [MANUFACTURER NAME],
		CAST(Source.[MANUFACTURER PART NUMBER] AS VARCHAR(255)) [MANUFACTURER PART NUMBER],
		CAST(Source.[ADDITIONAL PART NUMBER (TS)] AS VARCHAR(255)) [ADDITIONAL PART NUMBER (TS)],
		CAST(Source.[SHORT DESCRIPTION (Morsco Format)] AS VARCHAR(255)) [SHORT DESCRIPTION (Morsco Format)],
		CAST(Source.[PRODUCT NAME] AS VARCHAR(255)) [PRODUCT NAME],
		CAST(Source.[BRAND NAME] AS VARCHAR(255)) [BRAND NAME],
		CAST(Source.[SERIES MODEL FIGURE NUMBER] AS VARCHAR(255)) [SERIES MODEL FIGURE NUMBER],
		CAST(Source.[UPC] AS VARCHAR(255)) [UPC],
		CAST(Source.[UNSPSC] AS VARCHAR(255)) [UNSPSC],
		CAST(Source.[COMMODITY CODE DESCRIPTION_Level 1] AS VARCHAR(255)) [COMMODITY CODE DESCRIPTION_Level 1],
		CAST(Source.[COMMODITY CODE DESCRIPTION_Level 2] AS VARCHAR(255)) [COMMODITY CODE DESCRIPTION_Level 2],
		CAST(Source.[COMMODITY CODE DESCRIPTION_Level 3] AS VARCHAR(255)) [COMMODITY CODE DESCRIPTION_Level 3],
		CAST(Source.[COMMODITY CODE DESCRIPTION_Level 4] AS VARCHAR(255)) [COMMODITY CODE DESCRIPTION_Level 4],
		CAST(Source.[COMMODITY CODE DESCRIPTION_Level 5] AS VARCHAR(255)) [COMMODITY CODE DESCRIPTION_Level 5],
		--CAST(Source.[TS COMMODITY PARENT CLASS NAME] AS VARCHAR(255)) [TS SCHEMA PARENT CLASS NAME],
		--CAST(Source.[TS COMMODITY LEAF CLASS NAME] AS VARCHAR(255)) [TS SCHEMA LEAF CLASS NAME],
		CAST(Source.[Attribute Name_1] AS VARCHAR(255)) [Attribute Name_1],
		CAST(Source.[Attribute Value_1] AS VARCHAR(255)) [Attribute Value_1],
		CAST(Source.[Attribute Name_2] AS VARCHAR(255)) [Attribute Name_2],
		CAST(Source.[Attribute Value_2] AS VARCHAR(255)) [Attribute Value_2],
		CAST(Source.[Attribute Name_3] AS VARCHAR(255)) [Attribute Name_3],
		CAST(Source.[Attribute Value_3] AS VARCHAR(255)) [Attribute Value_3],
		CAST(Source.[Attribute Name_4] AS VARCHAR(255)) [Attribute Name_4],
		CAST(Source.[Attribute Value_4] AS VARCHAR(255)) [Attribute Value_4],
		CAST(Source.[Attribute Name_5] AS VARCHAR(255)) [Attribute Name_5],
		CAST(Source.[Attribute Value_5] AS VARCHAR(255)) [Attribute Value_5],
		CAST(Source.[Attribute Name_6] AS VARCHAR(255)) [Attribute Name_6],
		CAST(Source.[Attribute Value_6] AS VARCHAR(255)) [Attribute Value_6],
		CAST(Source.[Attribute Name_7] AS VARCHAR(255)) [Attribute Name_7],
		CAST(Source.[Attribute Value_7] AS VARCHAR(255)) [Attribute Value_7],
		CAST(Source.[Attribute Name_8] AS VARCHAR(255)) [Attribute Name_8],
		CAST(Source.[Attribute Value_8] AS VARCHAR(255)) [Attribute Value_8],
		CAST(Source.[Attribute Name_9] AS VARCHAR(255)) [Attribute Name_9],
		CAST(Source.[Attribute Value_9] AS VARCHAR(255)) [Attribute Value_9],
		CAST(Source.[Attribute Name_10] AS VARCHAR(255)) [Attribute Name_10],
		CAST(Source.[Attribute Value_10] AS VARCHAR(255)) [Attribute Value_10],
		CAST(Source.[Attribute Name_11] AS VARCHAR(255)) [Attribute Name_11],
		CAST(Source.[Attribute Value_11] AS VARCHAR(255)) [Attribute Value_11],
		CAST(Source.[Attribute Name_12] AS VARCHAR(255)) [Attribute Name_12],
		CAST(Source.[Attribute Value_12] AS VARCHAR(255)) [Attribute Value_12],
		CAST(Source.[Attribute Name_13] AS VARCHAR(255)) [Attribute Name_13],
		CAST(Source.[Attribute Value_13] AS VARCHAR(255)) [Attribute Value_13],
		CAST(Source.[Attribute Name_14] AS VARCHAR(255)) [Attribute Name_14],
		CAST(Source.[Attribute Value_14] AS VARCHAR(255)) [Attribute Value_14],
		CAST(Source.[Attribute Name_15] AS VARCHAR(255)) [Attribute Name_15],
		CAST(Source.[Attribute Value_15] AS VARCHAR(255)) [Attribute Value_15],
		CAST(Source.[Attribute Name_16] AS VARCHAR(255)) [Attribute Name_16],
		CAST(Source.[Attribute Value_16] AS VARCHAR(255)) [Attribute Value_16],
		CAST(Source.[Attribute Name_17] AS VARCHAR(255)) [Attribute Name_17],
		CAST(Source.[Attribute Value_17] AS VARCHAR(255)) [Attribute Value_17],
		CAST(Source.[Attribute Name_18] AS VARCHAR(255)) [Attribute Name_18],
		CAST(Source.[Attribute Value_18] AS VARCHAR(255)) [Attribute Value_18],
		CAST(Source.[Attribute Name_19] AS VARCHAR(255)) [Attribute Name_19],
		CAST(Source.[Attribute Value_19] AS VARCHAR(255)) [Attribute Value_19],
		CAST(Source.[Attribute Name_20] AS VARCHAR(255)) [Attribute Name_20],
		CAST(Source.[Attribute Value_20] AS VARCHAR(255)) [Attribute Value_20],
		CAST(Source.[Attribute Name_21] AS VARCHAR(255)) [Attribute Name_21],
		CAST(Source.[Attribute Value_21] AS VARCHAR(255)) [Attribute Value_21],
		CAST(Source.[Attribute Name_22] AS VARCHAR(255)) [Attribute Name_22],
		CAST(Source.[Attribute Value_22] AS VARCHAR(255)) [Attribute Value_22],
		CAST(Source.[Attribute Name_23] AS VARCHAR(255)) [Attribute Name_23],
		CAST(Source.[Attribute Value_23] AS VARCHAR(255)) [Attribute Value_23],
		CAST(Source.[Attribute Name_24] AS VARCHAR(255)) [Attribute Name_24],
		CAST(Source.[Attribute Value_24] AS VARCHAR(255)) [Attribute Value_24],
		CAST(Source.[Attribute Name_25] AS VARCHAR(255)) [Attribute Name_25],
		CAST(Source.[Attribute Value_25] AS VARCHAR(255)) [Attribute Value_25],
		CAST(Source.[Attribute Name_26] AS VARCHAR(255)) [Attribute Name_26],
		CAST(Source.[Attribute Value_26] AS VARCHAR(255)) [Attribute Value_26],
		CAST(Source.[Attribute Name_27] AS VARCHAR(255)) [Attribute Name_27],
		CAST(Source.[Attribute Value_27] AS VARCHAR(255)) [Attribute Value_27],
		CAST(Source.[Attribute Name_28] AS VARCHAR(255)) [Attribute Name_28],
		CAST(Source.[Attribute Value_28] AS VARCHAR(255)) [Attribute Value_28],
		CAST(Source.[Attribute Name_29] AS VARCHAR(255)) [Attribute Name_29],
		CAST(Source.[Attribute Value_29] AS VARCHAR(255)) [Attribute Value_29],
		CAST(Source.[Attribute Name_30] AS VARCHAR(255)) [Attribute Name_30],
		CAST(Source.[Attribute Value_30] AS VARCHAR(255)) [Attribute Value_30],
		CAST(Source.[Attribute Name_31] AS VARCHAR(255)) [Attribute Name_31],
		CAST(Source.[Attribute Value_31] AS VARCHAR(255)) [Attribute Value_31],
		CAST(Source.[Attribute Name_32] AS VARCHAR(255)) [Attribute Name_32],
		CAST(Source.[Attribute Value_32] AS VARCHAR(255)) [Attribute Value_32],
		CAST(Source.[Attribute Name_33] AS VARCHAR(255)) [Attribute Name_33],
		CAST(Source.[Attribute Value_33] AS VARCHAR(255)) [Attribute Value_33],
		CAST(Source.[Attribute Name_34] AS VARCHAR(255)) [Attribute Name_34],
		CAST(Source.[Attribute Value_34] AS VARCHAR(255)) [Attribute Value_34],
		CAST(Source.[Attribute Name_35] AS VARCHAR(255)) [Attribute Name_35],
		CAST(Source.[Attribute Value_35] AS VARCHAR(255)) [Attribute Value_35],
		CAST(Source.[Attribute Name_36] AS VARCHAR(255)) [Attribute Name_36],
		CAST(Source.[Attribute Value_36] AS VARCHAR(255)) [Attribute Value_36],
		CAST(Source.[Attribute Name_37] AS VARCHAR(255)) [Attribute Name_37],
		CAST(Source.[Attribute Value_37] AS VARCHAR(255)) [Attribute Value_37],
		CAST(Source.[Attribute Name_38] AS VARCHAR(255)) [Attribute Name_38],
		CAST(Source.[Attribute Value_38] AS VARCHAR(255)) [Attribute Value_38],
		CAST(Source.[Attribute Name_39] AS VARCHAR(255)) [Attribute Name_39],
		CAST(Source.[Attribute Value_39] AS VARCHAR(255)) [Attribute Value_39],
		CAST(Source.[Attribute Name_40] AS VARCHAR(255)) [Attribute Name_40],
		CAST(Source.[Attribute Value_40] AS VARCHAR(255)) [Attribute Value_40],
		CAST(Source.[Attribute Name_41] AS VARCHAR(255)) [Attribute Name_41],
		CAST(Source.[Attribute Value_41] AS VARCHAR(255)) [Attribute Value_41],
		CAST(Source.[Attribute Name_42] AS VARCHAR(255)) [Attribute Name_42],
		CAST(Source.[Attribute Value_42] AS VARCHAR(255)) [Attribute Value_42],
		CAST(Source.[Attribute Name_43] AS VARCHAR(255)) [Attribute Name_43],
		CAST(Source.[Attribute Value_43] AS VARCHAR(255)) [Attribute Value_43],
		CAST(Source.[Attribute Name_44] AS VARCHAR(255)) [Attribute Name_44],
		CAST(Source.[Attribute Value_44] AS VARCHAR(255)) [Attribute Value_44],
		CAST(Source.[Attribute Name_45] AS VARCHAR(255)) [Attribute Name_45],
		CAST(Source.[Attribute Value_45] AS VARCHAR(255)) [Attribute Value_45],
		CAST(Source.[Attribute Name_46] AS VARCHAR(255)) [Attribute Name_46],
		CAST(Source.[Attribute Value_46] AS VARCHAR(255)) [Attribute Value_46],
		CAST(Source.[Attribute Name_47] AS VARCHAR(255)) [Attribute Name_47],
		CAST(Source.[Attribute Value_47] AS VARCHAR(255)) [Attribute Value_47],
		CAST(Source.[Attribute Name_48] AS VARCHAR(255)) [Attribute Name_48],
		CAST(Source.[Attribute Value_48] AS VARCHAR(255)) [Attribute Value_48],
		CAST(Source.[Attribute Name_49] AS VARCHAR(255)) [Attribute Name_49],
		CAST(Source.[Attribute Value_49] AS VARCHAR(255)) [Attribute Value_49],
		CAST(Source.[Attribute Name_50] AS VARCHAR(255)) [Attribute Name_50],
		CAST(Source.[Attribute Value_50] AS VARCHAR(255)) [Attribute Value_50],
		CAST(Source.[ADDITIONAL INFORMATION] AS VARCHAR(255)) [ADDITIONAL INFORMATION],
		CAST(Source.[LONG DESCRIPTION] AS VARCHAR(MAX)) [LONG DESCRIPTION],
		CAST(Source.[FEATURES BENEFITS] AS VARCHAr(MAX)) [FEATURES BENEFITS],
		CAST(Source.[ITEM WEIGHT (pounds)] AS VARCHAR(255)) [ITEM WEIGHT (pounds)],
		CAST(Source.[PACKAGE WEIGHT (pounds)] AS VARCHAR(255)) [PACKAGE WEIGHT (pounds)],
		CAST(Source.[PACKAGE WIDTH (inch)] AS VARCHAR(255)) [PACKAGE WIDTH (inch)],
		CAST(Source.[PACKAGE LENGTH (inch)] AS VARCHAR(255)) [PACKAGE LENGTH (inch)],
		CAST(Source.[PACKAGE HEIGHT (inch)] AS VARCHAR(255)) [PACKAGE HEIGHT (inch)],
		CAST(Source.[PACKAGE VOLUME (cubic inch)] AS VARCHAR(255)) [PACKAGE VOLUME (cubic inch)],
		CAST(Source.[COUNTRY of ORIGIN] AS VARCHAR(255)) [COUNTRY of ORIGIN],
		CAST(Source.[LEAD FREE (Yes or No)] AS VARCHAR(255)) [LEAD FREE (Yes or No)],
		CAST(Source.[MERCURY FREE (Yes or No)] AS VARCHAR(255)) [MERCURY FREE (Yes or No)],
		CAST(Source.[WATER SENSE SAVER (Yes or No)] AS VARCHAR(255)) [WATER SENSE SAVER (Yes or No)],
		CAST(Source.[ENERGY STAR RATED (Yes or No)] AS VARCHAR(255)) [ENERGY STAR RATED (Yes or No)],
		CAST(Source.[HAZARDOUS MATERIAL (Yes or No)] AS VARCHAR(255)) [HAZARDOUS MATERIAL (Yes or No)],
		CAST(Source.[IMAGE_Large (600 x 600)] AS VARCHAR(1024)) [IMAGE URL_Large (600 x 600)],
		CAST(Source.[IMAGE NAME_Large (600 x 600)] AS VARCHAR(255)) [IMAGE NAME_Large (600 x 600)],
		CAST(Source.[IMAGE_Medium (145 x 145)] AS VARCHAR(1024)) [IMAGE URL_Medium (145 x 145)],
		CAST(Source.[IMAGE NAME_Medium (145 x 145)] AS VARCHAR(255)) [IMAGE NAME_Medium (145 x 145)],
		CAST(Source.[IMAGE_Small (75 x 75)] AS VARCHAR(1024)) [IMAGE URL_Small (75 x 75)],
		CAST(Source.[IMAGE NAME_Small (75 x 75)] AS VARCHAR(255)) [IMAGE NAME_Small (75 x 75)],
		CAST(Source.[MFR CATALOG DOCUMENT] AS VARCHAR(1024)) [MFR CATALOG DOCUMENT],
		CAST(Source.[MFR CATALOG DOCUMENT NAME] AS VARCHAR(255)) [MFR CATALOG DOCUMENT NAME],
		CAST(Source.[MFR SPECIFICATION TECHNICAL DOCUMENT] AS VARCHAR(1024)) [MFR SPECIFICATION TECHNICAL DOCUMENT],
		CAST(Source.[MFR SPECIFICATION TECHNICAL DOCUMENT NAME] AS VARCHAR(255)) [MFR SPECIFICATION TECHNICAL DOCUMENT NAME],
		CAST(Source.[MFR ITEM DATA DOCUMENT] AS VARCHAR(1024)) [MFR ITEM DATA DOCUMENT],
		CAST(Source.[MFR ITEM DATA DOCUMENT NAME] AS VARCHAR(255)) [MFR ITEM DATA DOCUMENT NAME],
		CAST(Source.[MFR MSDS DOCUMENT] AS VARCHAR(1024)) [MFR MSDS DOCUMENT],
		CAST(Source.[MFR MSDS DOCUMENT NAME] AS VARCHAR(255)) [MFR MSDS DOCUMENT NAME],
		CAST(Source.[MFR INSTALLATION OPERATOR DOCUMENT] AS VARCHAR(1024)) [MFR INSTALLATION OPERATOR DOCUMENT],
		CAST(Source.[MFR INSTALLATION OPERATOR DOCUMENT NAME] AS VARCHAR(255)) [MFR INSTALLATION OPERATOR DOCUMENT NAME],
		CAST(Source.[TS_STATUS] AS VARCHAR(255)) [TS_STATUS],
		CAST(Source.[TS_COMMENTS for CUSTOMER] AS VARCHAR(1500)) [TS_COMMENTS for CUSTOMER],
		CAST(Source.[ADDITIONAL URL_1 (Mfr Item Page)] AS VARCHAR(1024)) [ADDITIONAL URL_1 (Mfr Item Page)],
		CAST(Source.[ADDITIONAL URL_2] AS VARCHAR(1024)) [ADDITIONAL URL_2]
		INTO #Scrub
		FROM TradeServicesProduct_Scrub Source (NOLOCK) 

	CREATE INDEX IX_Scrub ON #Scrub(TS_ID)


			;MERGE [dbo].[TradeServicesProduct] AS Target
			USING
			(
				SELECT * FROM #Scrub AS Source
			) AS Source
			ON Target.CustomerItemId = Source.[CUSTOMER_Item ID]
		WHEN MATCHED AND 
			(
				Target.CustomerManufacturerName <> Source.[CUSTOMER_Manufacturer Name]
				OR Target.CustomerManufacturerPartNumber <> Source.[CUSTOMER_Manufacturer Part Number]
				OR Target.CustomerDescription <> Source.[CUSTOMER_Description]
				OR Target.CustomerUPC <> Source.[CUSTOMER_UPC]
				OR Target.CustomerPriceLine <> Source.[CUSTOMER_Price Line]
				OR Target.[CustomerPC] <> Source.[CUSTOMER_P C]
				OR Target.[CustomerStatus] <> Source.[CUSTOMER_Status]
				OR Target.[CustomerSellGroup] <> Source.[CUSTOMER_Sell Group]
				OR Target.CommodityGeneric <> Source.[COMMODITY GENERIC (Yes or No)]
				OR Target.ManufacturerName <> Source.[MANUFACTURER NAME]
				OR Target.ManufacturerPartNumber <> Source.[Manufacturer Part Number]
				OR Target.[AdditionalPartNumberTS] <> Source.[ADDITIONAL PART NUMBER (TS)]
				OR Target.ShortDescription <> Source.[SHORT DESCRIPTION (Morsco Format)]
				OR Target.ProductName <> Source.[Product Name]
				OR Target.BrandName <> Source.[BRAND NAME]
				OR Target.SeriesModelFigureNumber <> Source.[SERIES MODEL FIGURE NUMBER]
				OR Target.UPC <> Source.[UPC]
				OR Target.UnspscCode <> Source.[UNSPSC]
				OR Target.[CommodityCodeDescriptionLevel1] <> Source.[COMMODITY CODE DESCRIPTION_Level 1]
				OR Target.[CommodityCodeDescriptionLevel2] <> Source.[COMMODITY CODE DESCRIPTION_Level 2]
				OR Target.[CommodityCodeDescriptionLevel3] <> Source.[COMMODITY CODE DESCRIPTION_Level 3]
				OR Target.[CommodityCodeDescriptionLevel4] <> Source.[COMMODITY CODE DESCRIPTION_Level 4]
				OR Target.[CommodityCodeDescriptionLevel5] <> Source.[COMMODITY CODE DESCRIPTION_Level 5]
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
				OR Target.AttributeName23 <> Source.[Attribute Name_23]
				OR Target.AttributeValue23 <> Source.[Attribute Value_23]
				OR Target.AttributeName24 <> Source.[Attribute Name_24]
				OR Target.AttributeValue24 <> Source.[Attribute Value_24]
				OR Target.AttributeName25 <> Source.[Attribute Name_25]
				OR Target.AttributeValue25 <> Source.[Attribute Value_25]
				OR Target.AttributeName26 <> Source.[Attribute Name_26]
				OR Target.AttributeValue26 <> Source.[Attribute Value_26]
				OR Target.AttributeName27 <> Source.[Attribute Name_27]
				OR Target.AttributeValue27 <> Source.[Attribute Value_27]
				OR Target.AttributeName28 <> Source.[Attribute Name_28]
				OR Target.AttributeValue28 <> Source.[Attribute Value_28]
				OR Target.AttributeName29 <> Source.[Attribute Name_29]
				OR Target.AttributeValue29 <> Source.[Attribute Value_29]
				OR Target.AttributeName30 <> Source.[Attribute Name_30]
				OR Target.AttributeValue30 <> Source.[Attribute Value_30]
				OR Target.AttributeName31 <> Source.[Attribute Name_31]
				OR Target.AttributeValue31 <> Source.[Attribute Value_31]
				OR Target.AttributeName32 <> Source.[Attribute Name_32]
				OR Target.AttributeValue32 <> Source.[Attribute Value_32]
				OR Target.AttributeName33 <> Source.[Attribute Name_33]
				OR Target.AttributeValue33 <> Source.[Attribute Value_33]
				OR Target.AttributeName34 <> Source.[Attribute Name_34]
				OR Target.AttributeValue34 <> Source.[Attribute Value_34]
				OR Target.AttributeName35 <> Source.[Attribute Name_35]
				OR Target.AttributeValue35 <> Source.[Attribute Value_35]
				OR Target.AttributeName36 <> Source.[Attribute Name_36]
				OR Target.AttributeValue36 <> Source.[Attribute Value_36]
				OR Target.AttributeName37 <> Source.[Attribute Name_37]
				OR Target.AttributeValue37 <> Source.[Attribute Value_37]
				OR Target.AttributeName38 <> Source.[Attribute Name_38]
				OR Target.AttributeValue38 <> Source.[Attribute Value_38]
				OR Target.AttributeName39 <> Source.[Attribute Name_39]
				OR Target.AttributeValue39 <> Source.[Attribute Value_39]
				OR Target.AttributeName40 <> Source.[Attribute Name_40]
				OR Target.AttributeValue40 <> Source.[Attribute Value_40]
				OR Target.AttributeName41 <> Source.[Attribute Name_41]
				OR Target.AttributeValue41 <> Source.[Attribute Value_41]
				OR Target.AttributeName42 <> Source.[Attribute Name_42]
				OR Target.AttributeValue42 <> Source.[Attribute Value_42]
				OR Target.AttributeName43 <> Source.[Attribute Name_43]
				OR Target.AttributeValue43 <> Source.[Attribute Value_43]
				OR Target.AttributeName44 <> Source.[Attribute Name_44]
				OR Target.AttributeValue44 <> Source.[Attribute Value_44]
				OR Target.AttributeName45 <> Source.[Attribute Name_45]
				OR Target.AttributeValue45 <> Source.[Attribute Value_45]
				OR Target.AttributeName46 <> Source.[Attribute Name_46]
				OR Target.AttributeValue46 <> Source.[Attribute Value_46]
				OR Target.AttributeName47 <> Source.[Attribute Name_47]
				OR Target.AttributeValue47 <> Source.[Attribute Value_47]
				OR Target.AttributeName48 <> Source.[Attribute Name_48]
				OR Target.AttributeValue48 <> Source.[Attribute Value_48]
				OR Target.AttributeName49 <> Source.[Attribute Name_49]
				OR Target.AttributeValue49 <> Source.[Attribute Value_49]
				OR Target.AttributeName50 <> Source.[Attribute Name_50]
				OR Target.AttributeValue50 <> Source.[Attribute Value_50]
				OR Target.AdditionalInformation <> Source.[ADDITIONAL INFORMATION]
				OR Target.LongDescription <> Source.[LONG DESCRIPTION]
				OR Target.FeaturesBenefits <> Source.[FEATURES BENEFITS]
				OR Target.ItemWeight <> Source.[ITEM WEIGHT (pounds)]
				OR Target.PackageWeight <> Source.[PACKAGE WEIGHT (pounds)]
				OR Target.PackageWidth <> Source.[PACKAGE WIDTH (inch)]
				OR Target.PackageLength <> Source.[PACKAGE LENGTH (inch)]
				OR Target.PackageHeight <> Source.[PACKAGE HEIGHT (inch)]
				OR Target.PackageVolume <> Source.[PACKAGE VOLUME (cubic inch)]
				OR Target.CountryOfOrigin <> Source.[COUNTRY OF ORIGIN]
				OR Target.LeadFree <> Source.[LEAD FREE (Yes or No)]
				OR Target.MercuryFree <> Source.[MERCURY FREE (Yes or No)]
				OR Target.WaterSenseSaver <> Source.[WATER SENSE SAVER (Yes or No)]
				OR Target.EnergyStarRated <> Source.[ENERGY STAR RATED (Yes or No)]
				OR Target.MercuryFree <> Source.[MERCURY FREE (Yes or No)]
				OR Target.HazardousMaterial <> Source.[HAZARDOUS MATERIAL (Yes or No)]
				OR Target.LargeImage <> Source.[IMAGE URL_Large (600 x 600)]
				OR Target.MediumImage <> Source.[IMAGE URL_Medium (145 x 145)]
				OR Target.SmallImage <> Source.[IMAGE URL_Small (75 x 75)]
				OR Target.MfrCatalogDocument <> Source.[MFR CATALOG DOCUMENT]
				OR Target.MfrItemDataDocument <> Source.[MFR ITEM DATA DOCUMENT]
				OR Target.MfrSpecificationTechnicalDocument <> Source.[MFR SPECIFICATION TECHNICAL DOCUMENT]
				OR Target.MfrMsdsDocument <> Source.[MFR MSDS DOCUMENT]
				OR Target.MfrInstallationOperatorDocument <> Source.[MFR INSTALLATION OPERATOR DOCUMENT]
				OR Target.TsStatus <> Source.[TS_STATUS]
				OR Target.TsCommentsForCustomer <> Source.[TS_COMMENTS FOR CUSTOMER]
				OR Target.MfrItemPage <> Source.[ADDITIONAL URL_1 (Mfr Item Page)]
				OR Target.AdditionalUrl2 <> Source.[ADDITIONAL URL_2]
			) THEN
			UPDATE SET 
				Target.CustomerManufacturerName = Source.[CUSTOMER_Manufacturer Name],
				Target.CustomerManufacturerPartNumber = Source.[CUSTOMER_Manufacturer Part Number],
				Target.CustomerDescription = Source.[CUSTOMER_Description],
				Target.CustomerUPC = Source.[CUSTOMER_UPC],
				Target.CustomerPriceLine = Source.[CUSTOMER_Price Line],
				Target.[CustomerPC] = Source.[CUSTOMER_P C],
				Target.[CustomerStatus] = Source.[CUSTOMER_Status],
				Target.[CustomerSellGroup] = Source.[CUSTOMER_Sell Group],
				Target.CommodityGeneric = Source.[COMMODITY GENERIC (Yes or No)],
				Target.ManufacturerName = Source.[MANUFACTURER NAME],
				Target.ManufacturerPartNumber = Source.[Manufacturer Part Number],
				Target.[AdditionalPartNumberTS] = Source.[ADDITIONAL PART NUMBER (TS)],
				Target.ShortDescription = Source.[SHORT DESCRIPTION (Morsco Format)],
				Target.ProductName = Source.[Product Name],
				Target.BrandName = Source.[BRAND NAME],
				Target.SeriesModelFigureNumber = Source.[SERIES MODEL FIGURE NUMBER],
				Target.UPC = Source.[UPC],
				Target.UnspscCode = Source.[Unspsc],
				Target.[CommodityCodeDescriptionLevel1] = [dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 1]),
				Target.[CommodityCodeDescriptionLevel2] = [dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 2]),
				Target.[CommodityCodeDescriptionLevel3] = [dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 3]),
				Target.[CommodityCodeDescriptionLevel4] = [dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 4]),
				Target.[CommodityCodeDescriptionLevel5] = [dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 5]),
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
				Target.AttributeName23 = Source.[Attribute Name_23],
				Target.AttributeValue23 = Source.[Attribute Value_23],
				Target.AttributeName24 = Source.[Attribute Name_24],
				Target.AttributeValue24 = Source.[Attribute Value_24],
				Target.AttributeName25 = Source.[Attribute Name_25],
				Target.AttributeValue25 = Source.[Attribute Value_25],
				Target.AttributeName26 = Source.[Attribute Name_26],
				Target.AttributeValue26 = Source.[Attribute Value_26],
				Target.AttributeName27 = Source.[Attribute Name_27],
				Target.AttributeValue27 = Source.[Attribute Value_27],
				Target.AttributeName28 = Source.[Attribute Name_28],
				Target.AttributeValue28 = Source.[Attribute Value_28],
				Target.AttributeName29 = Source.[Attribute Name_29],
				Target.AttributeValue29 = Source.[Attribute Value_29],
				Target.AttributeName30 = Source.[Attribute Name_30],
				Target.AttributeValue30 = Source.[Attribute Value_30],
				Target.AttributeName31 = Source.[Attribute Name_31],
				Target.AttributeValue31 = Source.[Attribute Value_31],
				Target.AttributeName32 = Source.[Attribute Name_32],
				Target.AttributeValue32 = Source.[Attribute Value_32],
				Target.AttributeName33 = Source.[Attribute Name_33],
				Target.AttributeValue33 = Source.[Attribute Value_33],
				Target.AttributeName34 = Source.[Attribute Name_34],
				Target.AttributeValue34 = Source.[Attribute Value_34],
				Target.AttributeName35 = Source.[Attribute Name_35],
				Target.AttributeValue35 = Source.[Attribute Value_35],
				Target.AttributeName36 = Source.[Attribute Name_36],
				Target.AttributeValue36 = Source.[Attribute Value_36],
				Target.AttributeName37 = Source.[Attribute Name_37],
				Target.AttributeValue37 = Source.[Attribute Value_37],
				Target.AttributeName38 = Source.[Attribute Name_38],
				Target.AttributeValue38 = Source.[Attribute Value_38],
				Target.AttributeName39 = Source.[Attribute Name_39],
				Target.AttributeValue39 = Source.[Attribute Value_39],
				Target.AttributeName40 = Source.[Attribute Name_40],
				Target.AttributeValue40 = Source.[Attribute Value_40],
				Target.AttributeName41 = Source.[Attribute Name_41],
				Target.AttributeValue41 = Source.[Attribute Value_41],
				Target.AttributeName42 = Source.[Attribute Name_42],
				Target.AttributeValue42 = Source.[Attribute Value_42],
				Target.AttributeName43 = Source.[Attribute Name_43],
				Target.AttributeValue43 = Source.[Attribute Value_43],
				Target.AttributeName44 = Source.[Attribute Name_44],
				Target.AttributeValue44 = Source.[Attribute Value_44],
				Target.AttributeName45 = Source.[Attribute Name_45],
				Target.AttributeValue45 = Source.[Attribute Value_45],
				Target.AttributeName46 = Source.[Attribute Name_46],
				Target.AttributeValue46 = Source.[Attribute Value_46],
				Target.AttributeName47 = Source.[Attribute Name_47],
				Target.AttributeValue47 = Source.[Attribute Value_47],
				Target.AttributeName48 = Source.[Attribute Name_48],
				Target.AttributeValue48 = Source.[Attribute Value_48],
				Target.AttributeName49 = Source.[Attribute Name_49],
				Target.AttributeValue49 = Source.[Attribute Value_49],
				Target.AttributeName50 = Source.[Attribute Name_50],
				Target.AttributeValue50 = Source.[Attribute Value_50],
				Target.AdditionalInformation = Source.[ADDITIONAL INFORMATION],
				Target.LongDescription = Source.[LONG DESCRIPTION],
				Target.FeaturesBenefits = Source.[FEATURES BENEFITS],
				Target.ItemWeight = Source.[ITEM WEIGHT (pounds)],
				Target.PackageWeight = Source.[PACKAGE WEIGHT (pounds)],
				Target.PackageWidth = Source.[PACKAGE WIDTH (inch)],
				Target.PackageLength = Source.[PACKAGE LENGTH (inch)],
				Target.PackageHeight = Source.[PACKAGE HEIGHT (inch)],
				Target.PackageVolume = Source.[PACKAGE VOLUME (cubic inch)],
				Target.CountryOfOrigin = Source.[COUNTRY OF ORIGIN],
				Target.LeadFree = Source.[LEAD FREE (Yes or No)],
				Target.MercuryFree = Source.[MERCURY FREE (Yes or No)],
				Target.WaterSenseSaver = Source.[WATER SENSE SAVER (Yes or No)],
				Target.EnergyStarRated = Source.[ENERGY STAR RATED (Yes or No)],
				Target.HazardousMaterial = Source.[HAZARDOUS MATERIAL (Yes or No)],
				Target.LargeImage = Source.[IMAGE URL_Large (600 x 600)],
				Target.MediumImage = Source.[IMAGE URL_Medium (145 x 145)],
				Target.SmallImage = Source.[IMAGE URL_Small (75 x 75)],
				Target.MfrCatalogDocument = Source.[MFR CATALOG DOCUMENT],
				Target.MfrItemDataDocument = Source.[MFR ITEM DATA DOCUMENT],
				Target.MfrSpecificationTechnicalDocument = Source.[MFR SPECIFICATION TECHNICAL DOCUMENT],
				Target.MfrMsdsDocument = Source.[MFR MSDS DOCUMENT],
				Target.MfrInstallationOperatorDocument = Source.[MFR INSTALLATION OPERATOR DOCUMENT],
				Target.TsStatus = Source.[TS_STATUS],
				Target.TsCommentsForCustomer = Source.[TS_COMMENTS FOR CUSTOMER],
				Target.MfrItemPage = Source.[ADDITIONAL URL_1 (Mfr Item Page)],
				Target.AdditionalUrl2 = Source.[ADDITIONAL URL_2],
				--Update FullPath of the Category all the time 
				Target.FullPath	= [dbo].[fn_ScrubData](Source.[COMMODITY CODE DESCRIPTION_Level 1] + 
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 2] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 3] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 4] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 5] END  
						),
				Target.CategoryPath1 = CASE 
					WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 1],'') = '' THEN ''
					ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
					END,
				Target.CategoryPath2 = CASE 
					WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN ''
					ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
					+ ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') 
					END,
				Target.CategoryPath3 = CASE 
					WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN ''
					ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1]) 
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
					END,
				Target.CategoryPath4 = CASE 
					WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN ''
					ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 4]) END
					END,
				Target.CategoryPath5 = CASE 
					WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN ''
					ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 4]) END
					+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 5]) END
					END
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
					 [TradeServices_ID]
					,[CustomerItemID]
					,[CustomerManufacturerName]
					,[CustomerManufacturerPartNumber]
					,[CustomerDescription]
					,[CustomerUPC]
					,[CustomerPriceLine]
					,[CustomerPC]
					,[CustomerStatus]
					,[CustomerSellGroup]
					,[CommodityGeneric]
					,[ManufacturerName]
					,[ManufacturerPartNumber]
					,[AdditionalPartNumberTS]
					,[ShortDescription]
					,[ProductName]
					,[BrandName]
					,[SeriesModelFigureNumber]
					,[UPC]
					,[UnspscCode]
					,[CommodityCodeDescriptionLevel1]
					,[CommodityCodeDescriptionLevel2]
					,[CommodityCodeDescriptionLevel3]
					,[CommodityCodeDescriptionLevel4]
					,[CommodityCodeDescriptionLevel5]
					,[AttributeName1]
					,[AttributeValue1]
					,[AttributeName2]
					,[AttributeValue2]
					,[AttributeName3]
					,[AttributeValue3]
					,[AttributeName4]
					,[AttributeValue4]
					,[AttributeName5]
					,[AttributeValue5]
					,[AttributeName6]
					,[AttributeValue6]
					,[AttributeName7]
					,[AttributeValue7]
					,[AttributeName8]
					,[AttributeValue8]
					,[AttributeName9]
					,[AttributeValue9]
					,[AttributeName10]
					,[AttributeValue10]
					,[AttributeName11]
					,[AttributeValue11]
					,[AttributeName12]
					,[AttributeValue12]
					,[AttributeName13]
					,[AttributeValue13]
					,[AttributeName14]
					,[AttributeValue14]
					,[AttributeName15]
					,[AttributeValue15]
					,[AttributeName16]
					,[AttributeValue16]
					,[AttributeName17]
					,[AttributeValue17]
					,[AttributeName18]
					,[AttributeValue18]
					,[AttributeName19]
					,[AttributeValue19]
					,[AttributeName20]
					,[AttributeValue20]
					,[AttributeName21]
					,[AttributeValue21]
					,[AttributeName22]
					,[AttributeValue22]
					,[AttributeName23]
					,[AttributeValue23]
					,[AttributeName24]
					,[AttributeValue24]
					,[AttributeName25]
					,[AttributeValue25]
					,[AttributeName26]
					,[AttributeValue26]
					,[AttributeName27]
					,[AttributeValue27]
					,[AttributeName28]
					,[AttributeValue28]
					,[AttributeName29]
					,[AttributeValue29]
					,[AttributeName30]
					,[AttributeValue30]
					,[AttributeName31]
					,[AttributeValue31]
					,[AttributeName32]
					,[AttributeValue32]
					,[AttributeName33]
					,[AttributeValue33]
					,[AttributeName34]
					,[AttributeValue34]
					,[AttributeName35]
					,[AttributeValue35]
					,[AttributeName36]
					,[AttributeValue36]
					,[AttributeName37]
					,[AttributeValue37]
					,[AttributeName38]
					,[AttributeValue38]
					,[AttributeName39]
					,[AttributeValue39]
					,[AttributeName40]
					,[AttributeValue40]
					,[AttributeName41]
					,[AttributeValue41]
					,[AttributeName42]
					,[AttributeValue42]
					,[AttributeName43]
					,[AttributeValue43]
					,[AttributeName44]
					,[AttributeValue44]
					,[AttributeName45]
					,[AttributeValue45]
					,[AttributeName46]
					,[AttributeValue46]
					,[AttributeName47]
					,[AttributeValue47]
					,[AttributeName48]
					,[AttributeValue48]
					,[AttributeName49]
					,[AttributeValue49]
					,[AttributeName50]
					,[AttributeValue50]
					,[AdditionalInformation]
					,[LongDescription]
					,[FeaturesBenefits]
					,[ItemWeight] 
					,[PackageWeight]
					,[PackageWidth]
					,[PackageLength]
					,[PackageHeight]
					,[PackageVolume]
					,[CountryOfOrigin]
					,[LeadFree]
					,[MercuryFree]
					,[WaterSenseSaver]
					,[EnergyStarRated]
					,[HazardousMaterial]
					,[LargeImage]
					,[MediumImage]
					,[SmallImage]
					,[MfrCatalogDOcument]
					,[MfrSpecificationTechnicalDocument]
					,[MfrItemDataDocument]
					,[MfrMsdsDocument]
					,[MfrInstallationOperatorDocument]
					,[TsStatus]
					,[TsCommentsForCustomer]
					,[MfrItemPage]
					,[AdditionalUrl2]
					,[FullPath]
					,[CategoryPath1]
					,[CategoryPath2]
					,[CategoryPath3]
					,[CategoryPath4]
					,[CategoryPath5]
					)
			VALUES
			(
					Source.[TS_ID]
					,Source.[CUSTOMER_Item ID]
					,Source.[CUSTOMER_Manufacturer Name]
					,Source.[CUSTOMER_Manufacturer Part Number]
					,Source.[CUSTOMER_Description]
					,Source.[CUSTOMER_UPC]
					,Source.[CUSTOMER_Price Line]
					,Source.[CUSTOMER_P C]
					,Source.[CUSTOMER_Status]
					,Source.[CUSTOMER_Sell Group]
					,Source.[COMMODITY GENERIC (Yes or No)]
					,Source.[MANUFACTURER NAME]
					,Source.[Manufacturer Part Number]
					,Source.[ADDITIONAL PART NUMBER (TS)]
					,Source.[SHORT DESCRIPTION (Morsco Format)]
					,Source.[Product Name]
					,Source.[BRAND NAME]
					,Source.[SERIES MODEL FIGURE NUMBER]
					,Source.[UPC]
					,Source.[Unspsc]
					,[dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 1])
					,[dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 2])
					,[dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 3])
					,[dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 4])
					,[dbo].fn_ScrubData(Source.[COMMODITY CODE DESCRIPTION_Level 5])
					,Source.[Attribute Name_1]
					,Source.[Attribute Value_1]
					,Source.[Attribute Name_2]
					,Source.[Attribute Value_2]
					,Source.[Attribute Name_3]
					,Source.[Attribute Value_3]
					,Source.[Attribute Name_4]
					,Source.[Attribute Value_4]
					,Source.[Attribute Name_5]
					,Source.[Attribute Value_5]
					,Source.[Attribute Name_6]
					,Source.[Attribute Value_6]
					,Source.[Attribute Name_7]
					,Source.[Attribute Value_7]
					,Source.[Attribute Name_8]
					,Source.[Attribute Value_8]
					,Source.[Attribute Name_9]
					,Source.[Attribute Value_9]
					,Source.[Attribute Name_10]
					,Source.[Attribute Value_10]
					,Source.[Attribute Name_11]
					,Source.[Attribute Value_11]
					,Source.[Attribute Name_12]
					,Source.[Attribute Value_12]
					,Source.[Attribute Name_13]
					,Source.[Attribute Value_13]
					,Source.[Attribute Name_14]
					,Source.[Attribute Value_14]
					,Source.[Attribute Name_15]
					,Source.[Attribute Value_15]
					,Source.[Attribute Name_16]
					,Source.[Attribute Value_16]
					,Source.[Attribute Name_17]
					,Source.[Attribute Value_17]
					,Source.[Attribute Name_18]
					,Source.[Attribute Value_18]
					,Source.[Attribute Name_19]
					,Source.[Attribute Value_19]
					,Source.[Attribute Name_20]
					,Source.[Attribute Value_20]
					,Source.[Attribute Name_21]
					,Source.[Attribute Value_21]
					,Source.[Attribute Name_22]
					,Source.[Attribute Value_22]
					,Source.[Attribute Name_23]
					,Source.[Attribute Value_23]
					,Source.[Attribute Name_24]
					,Source.[Attribute Value_24]
					,Source.[Attribute Name_25]
					,Source.[Attribute Value_25]
					,Source.[Attribute Name_26]
					,Source.[Attribute Value_26]
					,Source.[Attribute Name_27]
					,Source.[Attribute Value_27]
					,Source.[Attribute Name_28]
					,Source.[Attribute Value_28]
					,Source.[Attribute Name_29]
					,Source.[Attribute Value_29]
					,Source.[Attribute Name_30]
					,Source.[Attribute Value_30]
					,Source.[Attribute Name_31]
					,Source.[Attribute Value_31]
					,Source.[Attribute Name_32]
					,Source.[Attribute Value_32]
					,Source.[Attribute Name_33]
					,Source.[Attribute Value_33]
					,Source.[Attribute Name_34]
					,Source.[Attribute Value_34]
					,Source.[Attribute Name_35]
					,Source.[Attribute Value_35]
					,Source.[Attribute Name_36]
					,Source.[Attribute Value_36]
					,Source.[Attribute Name_37]
					,Source.[Attribute Value_37]
					,Source.[Attribute Name_38]
					,Source.[Attribute Value_38]
					,Source.[Attribute Name_39]
					,Source.[Attribute Value_39]
					,Source.[Attribute Name_40]
					,Source.[Attribute Value_40]
					,Source.[Attribute Name_41]
					,Source.[Attribute Value_41]
					,Source.[Attribute Name_42]
					,Source.[Attribute Value_42]
					,Source.[Attribute Name_43]
					,Source.[Attribute Value_43]
					,Source.[Attribute Name_44]
					,Source.[Attribute Value_44]
					,Source.[Attribute Name_45]
					,Source.[Attribute Value_45]
					,Source.[Attribute Name_46]
					,Source.[Attribute Value_46]
					,Source.[Attribute Name_47]
					,Source.[Attribute Value_47]
					,Source.[Attribute Name_48]
					,Source.[Attribute Value_48]
					,Source.[Attribute Name_49]
					,Source.[Attribute Value_49]
					,Source.[Attribute Name_50]
					,Source.[Attribute Value_50]
					,Source.[ADDITIONAL INFORMATION]
					,Source.[LONG DESCRIPTION]
					,Source.[Features Benefits]
					,Source.[ITEM WEIGHT (pounds)]
					,Source.[PACKAGE WEIGHT (pounds)]
					,Source.[PACKAGE WIDTH (inch)]
					,Source.[PACKAGE LENGTH (inch)]
					,Source.[PACKAGE HEIGHT (inch)]
					,Source.[PACKAGE VOLUME (cubic inch)]
					,Source.[Country Of Origin]
					,Source.[LEAD FREE (Yes or No)]
					,Source.[MERCURY FREE (Yes or No)]
					,Source.[WATER SENSE SAVER (Yes or No)]
					,Source.[ENERGY STAR RATED (Yes or No)]
					,Source.[HAZARDOUS MATERIAL (Yes or No)]
					,Source.[IMAGE URL_Large (600 x 600)]
					,Source.[IMAGE URL_Medium (145 x 145)]
					,Source.[IMAGE URL_Small (75 x 75)]
					,Source.[Mfr Catalog DOcument]
					,Source.[Mfr Specification Technical Document]
					,Source.[MFR ITEM DATA DOCUMENT]
					,Source.[Mfr Msds Document]
					,Source.[MFR INSTALLATION OPERATOR DOCUMENT]
					,Source.[Ts_Status]
					,Source.[Ts_Comments For Customer]
					,Source.[ADDITIONAL URL_1 (Mfr Item Page)]
					,Source.[Additional Url_2]
					,[dbo].[fn_ScrubData](Source.[COMMODITY CODE DESCRIPTION_Level 1] + 
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 2] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 3] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 4] END +
						CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN '' ELSE '|' + Source.[COMMODITY CODE DESCRIPTION_Level 5] END  
						)
					,CASE 
						WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 1],'') = '' THEN ''
						ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1]) 
					END 
					,CASE 
						WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN ''
						ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
						+ ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') 
					END 
					,CASE 
						WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN ''
						ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1]) 
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
					END 
					,CASE 
						WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN ''
						ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 4]) END
					END 
					,CASE 
						WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN ''
						ELSE dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 1])
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 2],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 2]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 3],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 3]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 4],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 4]) END
						+ CASE WHEN ISNULL(Source.[COMMODITY CODE DESCRIPTION_Level 5],'') = '' THEN '' ELSE '|' + dbo.fn_UrlEncode(Source.[COMMODITY CODE DESCRIPTION_Level 5]) END
					END 
				)
		--WHEN NOT MATCHED BY SOURCE THEN		 --TODO COMMENTED TEMPORARILY
			   --DELETE;   --TODO COMMENTED TEMPORARILY 
			   ;

		--*********************************************************************************************************************
		-- Remove duplicate categories 
		--*********************************************************************************************************************

		;WITH CTE1 AS
		(
		 SELECT 
			  CategoryPath1 ,
			  MIN(CommodityCodeDescriptionLevel1) Correct
		 FROM TradeServicesProduct (NOLOCK) 
		 GROUP BY CategoryPath1
		)
		UPDATE TSP
		SET TSP.CommodityCodeDescriptionLevel1 = CTE1.Correct
		FROM CTE1
		JOIN TradeServicesProduct TSP (NOLOCK)  ON TSP.CategoryPath1 = CTE1.CategoryPath1
		WHERE TSP.CommodityCodeDescriptionLevel1 <> CTE1.Correct

		;WITH CTE2 AS
		(
		 SELECT 
			  CategoryPath2 ,
			  MIN(CommodityCodeDescriptionLevel2) Correct
		 FROM TradeServicesProduct
		 GROUP BY CategoryPath2
		)
		UPDATE TSP
		SET TSP.CommodityCodeDescriptionLevel2 = CTE2.Correct
		FROM CTE2
		JOIN TradeServicesProduct TSP (NOLOCK)  ON TSP.CategoryPath2 = CTE2.CategoryPath2
		WHERE TSP.CommodityCodeDescriptionLevel2 <> CTE2.Correct

		;WITH CTE3 AS
		(
		 SELECT 
			  CategoryPath3 ,
			  MIN(CommodityCodeDescriptionLevel3) Correct
		 FROM TradeServicesProduct
		 GROUP BY CategoryPath3
		)
		UPDATE TSP
		SET TSP.CommodityCodeDescriptionLevel3 = CTE3.Correct
		FROM CTE3
		JOIN TradeServicesProduct TSP (NOLOCK)  ON TSP.CategoryPath3 = CTE3.CategoryPath3
		WHERE TSP.CommodityCodeDescriptionLevel3 <> CTE3.Correct

		;WITH CTE4 AS
		(
		 SELECT 
			  CategoryPath4 ,
			  MIN(CommodityCodeDescriptionLevel4) Correct
		 FROM TradeServicesProduct
		 GROUP BY CategoryPath4
		)
		UPDATE TSP
		SET TSP.CommodityCodeDescriptionLevel4 = CTE4.Correct
		FROM CTE4
		JOIN TradeServicesProduct TSP (NOLOCK)  ON TSP.CategoryPath4 = CTE4.CategoryPath4
		WHERE TSP.CommodityCodeDescriptionLevel4 <> CTE4.Correct

		;WITH CTE5 AS
		(
		 SELECT 
			  CategoryPath5 ,
			  MIN(CommodityCodeDescriptionLevel5) Correct
		 FROM TradeServicesProduct
		 GROUP BY CategoryPath5
		)
		UPDATE TSP
		SET TSP.CommodityCodeDescriptionLevel5 = CTE5.Correct
		FROM CTE5
		JOIN TradeServicesProduct TSP (NOLOCK)  ON TSP.CategoryPath5 = CTE5.CategoryPath5
		WHERE TSP.CommodityCodeDescriptionLevel5 <> CTE5.Correct
END