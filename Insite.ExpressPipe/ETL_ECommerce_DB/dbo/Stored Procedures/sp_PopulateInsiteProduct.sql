
CREATE PROCEDURE [dbo].[sp_PopulateInsiteProduct]
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteProduct]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteProduct] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
(
	
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @ErrorMessage VARCHAR(100);

	BEGIN TRY
		BEGIN TRANSACTION

--===============================================================================================================================================
-- Product 
--=============================================================================================================================

			;MERGE [Insite.Morsco]..Product AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Product AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.Name <> Source.Name
				OR Target.ShortDescription <> Source.ShortDescription
				OR Target.ERPDescription <> Source.ERPDescription
				OR Target.ProductCode <> Source.ProductCode
				OR Target.PriceCode <> Source.PriceCode
				OR Target.UnitOfMeasure <> Source.UnitOfMeasure
				OR Target.Sku <> Source.Sku
				OR Target.SmallImagePath <> Source.SmallImagePath
				OR ISNULL(Target.MediumImagePath,'') <> ISNULL(Source.MediumImagePath,'')
				OR Target.LargeImagePath <> Source.LargeImagePath
				OR Target.Drawing <> Source.Drawing
				OR Target.ActivateOn <> Source.ActivateOn
				OR ISNULL(Target.DeactivateOn,'1/1/1900') <> ISNULL(Source.DeactivateOn,'1/1/1900')
				OR Target.SortOrder <> Source.SortOrder
				OR Target.TaxCode1 <> Source.TaxCode1
				OR Target.TaxCode2 <> Source.TaxCode2
				OR Target.ShippingWeight <> Source.ShippingWeight
				OR Target.ShippingLength <> Source.ShippingLength
				OR Target.ShippingWidth <> Source.ShippingWidth
				OR Target.ShippingHeight <> Source.ShippingHeight
				OR ISNULL(Target.ShippingAmountOverride,0) <> ISNULL(Source.ShippingAmountOverride,0)
				OR Target.QtyPerShippingPackage <> Source.QtyPerShippingPackage
				OR Target.MetaKeywords <> Source.MetaKeywords
				OR Target.MetaDescription <> Source.MetaDescription
				OR Target.PageTitle <> Source.PageTitle
				OR Target.ShippingClassification <> Source.ShippingClassification
				OR Target.PackDescription <> Source.PackDescription
				OR Target.DisplayPricePerPiece <> Source.DisplayPricePerPiece
				OR Target.UnitCost <> Source.UnitCost
				OR Target.UrlSegment <> Source.UrlSegment
				OR ISNULL(Target.ContentManagerId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.ContentManagerId,'00000000-0000-0000-0000-000000000000')
				OR Target.IsGiftCard <> Source.IsGiftCard
				OR Target.AllowAnyGiftCardAmount <> Source.AllowAnyGiftCardAmount
				OR Target.ERPNumber <> Source.ERPNumber
				OR Target.IsOutOfStock <> Source.IsOutOfStock
				OR Target.UPCCode <> Source.UPCCode
				OR Target.ERPManaged <> Source.ERPManaged
				OR ISNULL(Target.DocumentManagerId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.DocumentManagerId,'00000000-0000-0000-0000-000000000000')
				OR Target.ModelNumber <> Source.ModelNumber
				OR ISNULL(Target.HandlingAmountOverride,0) <> ISNULL(Source.HandlingAmountOverride,0)
				OR Target.IsSubscription <> Source.IsSubscription
				OR Target.SubscriptionCyclePeriod <> Source.SubscriptionCyclePeriod
				OR Target.SubscriptionPeriodsPerCycle <> Source.SubscriptionPeriodsPerCycle
				OR Target.SubscriptionTotalCycles <> Source.SubscriptionTotalCycles
				OR Target.SubscriptionFixedPrice <> Source.SubscriptionFixedPrice
				OR Target.SubscriptionAddToInitialOrder <> Source.SubscriptionAddToInitialOrder
				OR ISNULL(Target.SubscriptionShipViaId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.SubscriptionShipViaId,'00000000-0000-0000-0000-000000000000')
				OR Target.SubscriptionAllMonths <> Source.SubscriptionAllMonths
				OR Target.SubscriptionJanuary <> Source.SubscriptionJanuary
				OR Target.SubscriptionFebruary <> Source.SubscriptionFebruary
				OR Target.SubscriptionMarch <> Source.SubscriptionMarch
				OR Target.SubscriptionApril <> Source.SubscriptionApril
				OR Target.SubscriptionMay <> Source.SubscriptionMay
				OR Target.SubscriptionJune <> Source.SubscriptionJune
				OR Target.SubscriptionJuly <> Source.SubscriptionJuly
				OR Target.SubscriptionAugust <> Source.SubscriptionAugust
				OR Target.SubscriptionSeptember <> Source.SubscriptionSeptember
				OR Target.SubscriptionOctober <> Source.SubscriptionOctober
				OR Target.SubscriptionNovember <> Source.SubscriptionNovember
				OR Target.SubscriptionDecember <> Source.SubscriptionDecember
				OR ISNULL(Target.VendorId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.VendorId,'00000000-0000-0000-0000-000000000000')
				OR Target.PriceBasis <> Source.PriceBasis
				OR Target.UseVendorMarkup <> Source.UseVendorMarkup
				OR Target.TrackInventory <> Source.TrackInventory
				OR Target.IsConfigured <> Source.IsConfigured
				OR Target.Configuration <> Source.Configuration
				OR Target.TaxCategory <> Source.TaxCategory
				OR Target.BasicListPrice <> Source.BasicListPrice
				OR Target.BasicSalePrice <> Source.BasicSalePrice
				OR ISNULL(Target.BasicSaleStartDate,'1/1/1900') <> ISNULL(Source.BasicSaleStartDate,'1/1/1900')
				OR ISNULL(Target.BasicSaleEndDate,'1/1/1900') <> ISNULL(Source.BasicSaleEndDate,'1/1/1900')
				OR ISNULL(Target.StyleClassId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.StyleClassId,'00000000-0000-0000-0000-000000000000')
				OR ISNULL(Target.StyleParentId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.StyleParentId,'00000000-0000-0000-0000-000000000000')
				OR Target.SearchLookup <> Source.SearchLookup
				OR ISNULL(Target.RestrictionGroupId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.RestrictionGroupId,'00000000-0000-0000-0000-000000000000')
				OR ISNULL(Target.ReplacementProductId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.ReplacementProductId,'00000000-0000-0000-0000-000000000000')
				OR Target.HasMsds <> Source.HasMsds
				OR Target.IsHazardousGood <> Source.IsHazardousGood
				OR Target.IsDiscontinued <> Source.IsDiscontinued
				OR Target.ManufacturerItem <> Source.ManufacturerItem
				OR Target.RoundingRule <> Source.RoundingRule
				OR Target.MultipleSaleQty <> Source.MultipleSaleQty
				OR Target.Unspsc <> Source.Unspsc
				OR Target.IsSpecialOrder <> Source.IsSpecialOrder
				OR Target.IsFixedConfiguration <> Source.IsFixedConfiguration
				OR ISNULL(Target.ConfigurationId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.ConfigurationId,'00000000-0000-0000-0000-000000000000')
				OR Target.IndexStatus <> Source.IndexStatus
				OR Target.QuoteOption <> Source.QuoteOption
				OR Target.ImageAltText <> Source.ImageAltText
				OR Target.LowStockLevel <> Source.LowStockLevel
			) THEN
			UPDATE SET 
				Target.Id = Source.Id,
				Target.Name = Source.Name,
				Target.ShortDescription = Source.ShortDescription,
				Target.ERPDescription = Source.ERPDescription,
				Target.ProductCode = Source.ProductCode,
				Target.PriceCode = Source.PriceCode,
				Target.UnitOfMeasure = Source.UnitOfMeasure,
				Target.Sku = Source.Sku,
				Target.SmallImagePath = Source.SmallImagePath,
				Target.MediumImagePath = Source.MediumImagePath,
				Target.LargeImagePath = Source.LargeImagePath,
				Target.Drawing = Source.Drawing,
				Target.ActivateOn = Source.ActivateOn,
				Target.DeactivateOn = Source.DeactivateOn,
				Target.SortOrder = Source.SortOrder,
				Target.TaxCode1 = Source.TaxCode1,
				Target.TaxCode2 = Source.TaxCode2,
				Target.ShippingWeight = Source.ShippingWeight,
				Target.ShippingLength = Source.ShippingLength,
				Target.ShippingWidth = Source.ShippingWidth,
				Target.ShippingHeight = Source.ShippingHeight,
				Target.ShippingAmountOverride = Source.ShippingAmountOverride,
				Target.QtyPerShippingPackage = Source.QtyPerShippingPackage,
				Target.MetaKeywords = Source.MetaKeywords,
				Target.MetaDescription = Source.MetaDescription,
				Target.PageTitle = Source.PageTitle,
				Target.ShippingClassification = Source.ShippingClassification,
				Target.PackDescription = Source.PackDescription,
				Target.DisplayPricePerPiece = Source.DisplayPricePerPiece,
				Target.UnitCost = Source.UnitCost,
				Target.UrlSegment = Source.UrlSegment,
				Target.ContentManagerId = Source.ContentManagerId,
				Target.IsGiftCard = Source.IsGiftCard,
				Target.AllowAnyGiftCardAmount = Source.AllowAnyGiftCardAmount,
				Target.ERPNumber = Source.ERPNumber,
				Target.IsOutOfStock = Source.IsOutOfStock,
				Target.UPCCode = Source.UPCCode,
				Target.ERPManaged = Source.ERPManaged,
				Target.DocumentManagerId = Source.DocumentManagerId,
				Target.ModelNumber = Source.ModelNumber,
				Target.HandlingAmountOverride = Source.HandlingAmountOverride,
				Target.IsSubscription = Source.IsSubscription,
				Target.SubscriptionCyclePeriod = Source.SubscriptionCyclePeriod,
				Target.SubscriptionPeriodsPerCycle = Source.SubscriptionPeriodsPerCycle,
				Target.SubscriptionTotalCycles = Source.SubscriptionTotalCycles,
				Target.SubscriptionFixedPrice = Source.SubscriptionFixedPrice,
				Target.SubscriptionAddToInitialOrder = Source.SubscriptionAddToInitialOrder,
				Target.SubscriptionShipViaId = Source.SubscriptionShipViaId,
				Target.SubscriptionAllMonths = Source.SubscriptionAllMonths,
				Target.SubscriptionJanuary = Source.SubscriptionJanuary,
				Target.SubscriptionFebruary = Source.SubscriptionFebruary,
				Target.SubscriptionMarch = Source.SubscriptionMarch,
				Target.SubscriptionApril = Source.SubscriptionApril,
				Target.SubscriptionMay = Source.SubscriptionMay,
				Target.SubscriptionJune = Source.SubscriptionJune,
				Target.SubscriptionJuly = Source.SubscriptionJuly,
				Target.SubscriptionAugust = Source.SubscriptionAugust,
				Target.SubscriptionSeptember = Source.SubscriptionSeptember,
				Target.SubscriptionOctober = Source.SubscriptionOctober,
				Target.SubscriptionNovember = Source.SubscriptionNovember,
				Target.SubscriptionDecember = Source.SubscriptionDecember,
				Target.VendorId = Source.VendorId,
				Target.PriceBasis = Source.PriceBasis,
				Target.UseVendorMarkup = Source.UseVendorMarkup,
				Target.TrackInventory = Source.TrackInventory,
				Target.IsConfigured = Source.IsConfigured,
				Target.Configuration = Source.Configuration,
				Target.TaxCategory = Source.TaxCategory,
				Target.BasicListPrice = Source.BasicListPrice,
				Target.BasicSalePrice = Source.BasicSalePrice,
				Target.BasicSaleStartDate = Source.BasicSaleStartDate,
				Target.BasicSaleEndDate = Source.BasicSaleEndDate,
				Target.StyleClassId = Source.StyleClassId,
				Target.StyleParentId = Source.StyleParentId,
				Target.SearchLookup = Source.SearchLookup,
				Target.RestrictionGroupId = Source.RestrictionGroupId,
				Target.ReplacementProductId = Source.ReplacementProductId,
				Target.HasMsds = Source.HasMsds,
				Target.IsHazardousGood = Source.IsHazardousGood,
				Target.IsDiscontinued = Source.IsDiscontinued,
				Target.ManufacturerItem = Source.ManufacturerItem,
				Target.RoundingRule = Source.RoundingRule,
				Target.MultipleSaleQty = Source.MultipleSaleQty,
				Target.Unspsc = Source.Unspsc,
				Target.IsSpecialOrder = Source.IsSpecialOrder,
				Target.IsFixedConfiguration = Source.IsFixedConfiguration,
				Target.ConfigurationId = Source.ConfigurationId,
				Target.IndexStatus = Source.IndexStatus,
				Target.QuoteOption = Source.QuoteOption,
				Target.ImageAltText = Source.ImageAltText,
				Target.LowStockLevel = Source.LowStockLevel,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      Name,
			      ShortDescription,
			      ERPDescription,
			      ProductCode,
			      PriceCode,
			      UnitOfMeasure,
			      Sku,
			      SmallImagePath,
			      MediumImagePath,
			      LargeImagePath,
			      Drawing,
			      ActivateOn,
			      DeactivateOn,
			      SortOrder,
			      TaxCode1,
			      TaxCode2,
			      ShippingWeight,
			      ShippingLength,
			      ShippingWidth,
			      ShippingHeight,
			      ShippingAmountOverride,
			      QtyPerShippingPackage,
			      MetaKeywords,
			      MetaDescription,
			      PageTitle,
			      ShippingClassification,
			      PackDescription,
			      DisplayPricePerPiece,
			      UnitCost,
			      UrlSegment,
			      ContentManagerId,
			      IsGiftCard,
			      AllowAnyGiftCardAmount,
			      ERPNumber,
			      IsOutOfStock,
			      UPCCode,
			      ERPManaged,
			      DocumentManagerId,
			      ModelNumber,
			      HandlingAmountOverride,
			      IsSubscription,
			      SubscriptionCyclePeriod,
			      SubscriptionPeriodsPerCycle,
			      SubscriptionTotalCycles,
			      SubscriptionFixedPrice,
			      SubscriptionAddToInitialOrder,
			      SubscriptionShipViaId,
			      SubscriptionAllMonths,
			      SubscriptionJanuary,
			      SubscriptionFebruary,
			      SubscriptionMarch,
			      SubscriptionApril,
			      SubscriptionMay,
			      SubscriptionJune,
			      SubscriptionJuly,
			      SubscriptionAugust,
			      SubscriptionSeptember,
			      SubscriptionOctober,
			      SubscriptionNovember,
			      SubscriptionDecember,
			      VendorId,
			      PriceBasis,
			      UseVendorMarkup,
			      TrackInventory,
			      IsConfigured,
			      Configuration,
			      TaxCategory,
			      BasicListPrice,
			      BasicSalePrice,
			      BasicSaleStartDate,
			      BasicSaleEndDate,
			      StyleClassId,
			      StyleParentId,
			      SearchLookup,
			      RestrictionGroupId,
			      ReplacementProductId,
			      HasMsds,
			      IsHazardousGood,
			      IsDiscontinued,
			      ManufacturerItem,
			      RoundingRule,
			      MultipleSaleQty,
			      Unspsc,
			      IsSpecialOrder,
			      IsFixedConfiguration,
			      ConfigurationId,
			      IndexStatus,
			      QuoteOption,
			      ImageAltText,
			      LowStockLevel,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.Name,
			   Source.ShortDescription,
			   Source.ERPDescription,
			   Source.ProductCode,
			   Source.PriceCode,
			   Source.UnitOfMeasure,
			   Source.Sku,
			   Source.SmallImagePath,
			   Source.MediumImagePath,
			   Source.LargeImagePath,
			   Source.Drawing,
			   Source.ActivateOn,
			   Source.DeactivateOn,
			   Source.SortOrder,
			   Source.TaxCode1,
			   Source.TaxCode2,
			   Source.ShippingWeight,
			   Source.ShippingLength,
			   Source.ShippingWidth,
			   Source.ShippingHeight,
			   Source.ShippingAmountOverride,
			   Source.QtyPerShippingPackage,
			   Source.MetaKeywords,
			   Source.MetaDescription,
			   Source.PageTitle,
			   Source.ShippingClassification,
			   Source.PackDescription,
			   Source.DisplayPricePerPiece,
			   Source.UnitCost,
			   Source.UrlSegment,
			   Source.ContentManagerId,
			   Source.IsGiftCard,
			   Source.AllowAnyGiftCardAmount,
			   Source.ERPNumber,
			   Source.IsOutOfStock,
			   Source.UPCCode,
			   Source.ERPManaged,
			   Source.DocumentManagerId,
			   Source.ModelNumber,
			   Source.HandlingAmountOverride,
			   Source.IsSubscription,
			   Source.SubscriptionCyclePeriod,
			   Source.SubscriptionPeriodsPerCycle,
			   Source.SubscriptionTotalCycles,
			   Source.SubscriptionFixedPrice,
			   Source.SubscriptionAddToInitialOrder,
			   Source.SubscriptionShipViaId,
			   Source.SubscriptionAllMonths,
			   Source.SubscriptionJanuary,
			   Source.SubscriptionFebruary,
			   Source.SubscriptionMarch,
			   Source.SubscriptionApril,
			   Source.SubscriptionMay,
			   Source.SubscriptionJune,
			   Source.SubscriptionJuly,
			   Source.SubscriptionAugust,
			   Source.SubscriptionSeptember,
			   Source.SubscriptionOctober,
			   Source.SubscriptionNovember,
			   Source.SubscriptionDecember,
			   Source.VendorId,
			   Source.PriceBasis,
			   Source.UseVendorMarkup,
			   Source.TrackInventory,
			   Source.IsConfigured,
			   Source.Configuration,
			   Source.TaxCategory,
			   Source.BasicListPrice,
			   Source.BasicSalePrice,
			   Source.BasicSaleStartDate,
			   Source.BasicSaleEndDate,
			   Source.StyleClassId,
			   Source.StyleParentId,
			   Source.SearchLookup,
			   Source.RestrictionGroupId,
			   Source.ReplacementProductId,
			   Source.HasMsds,
			   Source.IsHazardousGood,
			   Source.IsDiscontinued,
			   Source.ManufacturerItem,
			   Source.RoundingRule,
			   Source.MultipleSaleQty,
			   Source.Unspsc,
			   Source.IsSpecialOrder,
			   Source.IsFixedConfiguration,
			   Source.ConfigurationId,
			   Source.IndexStatus,
			   Source.QuoteOption,
			   Source.ImageAltText,
			   Source.LowStockLevel,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET Target.DeactivateOn = GETDATE(), ModifiedBy = @UserName, ModifiedOn=GetDate();

--===============================================================================================================================================
-- Product PUOM
--===============================================================================================================================================

;MERGE [Insite.Morsco]..ProductUnitOfMeasure AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ProductUnitOfMeasure AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.ProductId <> Source.ProductId
				OR Target.UnitOfMeasure <> Source.UnitOfMeasure
				OR Target.Description <> Source.Description
				OR Target.QtyPerBaseUnitOfMeasure <> Source.QtyPerBaseUnitOfMeasure
				OR Target.RoundingRule <> Source.RoundingRule
				OR Target.IsDefault <> Source.IsDefault
			) THEN
			UPDATE SET 
				Target.ProductId = Source.ProductId,
				Target.UnitOfMeasure = Source.UnitOfMeasure,
				Target.Description = Source.Description,
				Target.QtyPerBaseUnitOfMeasure = Source.QtyPerBaseUnitOfMeasure,
				Target.RoundingRule = Source.RoundingRule,
				Target.IsDefault = Source.IsDefault,
				Target.CreatedOn = Source.CreatedOn,
				Target.CreatedBy = Source.CreatedBy,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ProductId,
			      UnitOfMeasure,
			      Description,
			      QtyPerBaseUnitOfMeasure,
			      RoundingRule,
			      IsDefault,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ProductId,
			   Source.UnitOfMeasure,
			   Source.Description,
			   Source.QtyPerBaseUnitOfMeasure,
			   Source.RoundingRule,
			   Source.IsDefault,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

--===============================================================================================================================================
-- Product Property
--===============================================================================================================================================

		;MERGE [Insite.Morsco]..ProductProperty AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ProductProperty AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.ProductId <> Source.ProductId
				OR Target.Name <> Source.Name
				OR Target.Value <> Source.Value
			) THEN
			UPDATE SET 
				Target.ProductId = Source.ProductId,
				Target.Name = Source.Name,
				Target.Value = Source.Value,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ProductId,
			      Name,
			      Value,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ProductId,
			   Source.Name,
			   Source.Value,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;
--===============================================================================================================================================
--===============================================================================================================================================
		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;

END