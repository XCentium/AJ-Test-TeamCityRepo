







CREATE VIEW [dbo].[vw_ProductData] AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This View pulls all the products compatible with 
--				TradeServiceProduct data and Product data in the DM_ECommerce table
-- =============================================
			SELECT 
					--Id (SequentialID)
					--ROW_NUMBER() OVER(PARTITION BY p.ERPPartNo ORDER BY p.ERPPartNo, ETLSourceId DESC) AS Row, 
					p.ERPPartNo						as [Name],
					dbo.fn_ScrubData(ISNULL(TSP.SHORTDESCRIPTION,''))			as [ShortDescription],
					dbo.fn_ScrubData(ISNULL(TSP.CustomerDescription,''))			as [ERPDescription],
					ISNULL(p.ProductCode,'')		as [ProductCode],
					ISNULL(p.PriceCode,'')			as [PriceCode],
					ISNULL(p.BaseUnitOfMeasure,'')	as [UnitOfMeasure],
					ISNULL(TSP.ManufacturerPartNumber,'')		as Sku,
					REPLACE(ISNULL(TSP.SmallImage,''),'http:','https:')					as [SmallImagePath],
					REPLACE(ISNULL(TSP.MediumImage,''),'http:','https:')				as [MediumImagePath],
					REPLACE(ISNULL(TSP.LargeImage,''),'http:','https:')					as [LargeImagePath],
					'' as Drawing,
					SYSDATETIME()					as ActivateOn,
					null							as DeactivateOn,
					0								as SortOrder,
					''								as [TaxCode1],
					''								as [TaxCode2],
					ISNULL(TSP.PackageWeight,0)				as [ShippingWeight],
					ISNULL(TSP.PackageWidth,0)				as [ShippingWidth],
					ISNULL(TSP.PackageLength,0)				as [ShippingLength],
					ISNULL(TSP.PackageHeight,0)				as [ShippingHeight],
					NULL							as ShippingAmountOverride,
					0								as [QtyPerShippingPackage],
					dbo.fn_ScrubData2(isnull(p.Metadata,''))			as [MetaKeywords],
					''								as [MetaDescription],
					dbo.fn_ScrubData(ISNULL(TSP.CustomerDescription,''))			as [PageTitle], 
					''								as [ShippingClassification],
					''								as  [PackDescription],
					1								as [DisplayPricePerPiece],
					ISNULL(p.UnitCost,0)						as UnitCost,
					dbo.fn_UrlEncode(p.ERPPartNo) as UrlSegment,
					Null							as [ContentManagerId],
					0								as IsGiftCard,
					0								as AllowAnyGiftCardAmount,
					p.ERPPartNo						as ERPNumber,
					0								as IsOutOfStock,
					ISNULL(TSP.UPC,'')							as UPCCode,
					1								as ERPManaged,
					Null							as [DocumentManagerId],
					ISNULL(TSP.ManufacturerPartNumber,'')		[ModelNumber],
					0								as [HandlingAmountOverride],
					0								as [IsSubscription],
					''								as [SubscriptionCyclePeriod],
					0								as [SubscriptionPeriodsPerCycle],
					0								as [SubscriptionTotalCycles],
					0								as [SubscriptionFixedPrice],
					0								as [SubscriptionAddToInitialOrder],
					null							as [SubscriptionShipViaId],
					0								as [SubscriptionAllMonths],
					0								as [SubscriptionJanuary],
					0								as [SubscriptionFebruary],
					0								as [SubscriptionMarch],
					0								as [SubscriptionApril],
					0								as [SubscriptionMay],
					0								as [SubscriptionJune],
					0								as [SubscriptionJuly],
					0								as [SubscriptionAugust],
					0								as [SubscriptionSeptember],
					0								as [SubscriptionOctober],
					0								as [SubscriptionNovember],
					0								as [SubscriptionDecember],
					null							as [VendorId],
					''								as PriceBasis,
					1								as [UseVendorMarkup],
					1								as [TrackInventory],
					0								as [IsConfigured],
					0								as [Configuration],
					''								as [TaxCategory],
					0								as [BasicListPrice],
					0								as [BasicSalePrice],
					SYSDATETIME()					as [BasicSaleStartDate],
					null							as [BasicSaleEndDate],
					null							as [StyleClassId],
					null							as [StyleParentId],
					''								as [SearchLookup],
					null							as [RestrictionGroupId],
					null							as [ReplacementProductId],
					CASE WHEN ISNULL(TSP.MfrMsdsDocument,'') <> '' THEN
						1 ELSE 0 END as [HasMsds],
					CASE UPPER(TSP.[HazardousMaterial]) 
						WHEN 'YES' then 1 else 0 end
													as [IsHazardousGood],
					''								as IsDiscontinued,
					ISNULL(TSP.ManufacturerPartNumber,'')		[ManufacturerItem],
					''								as RoundingRule,
					0								as [MultipleSaleQty],
					''								as [Unspsc],
					0								as [IsSpecialOrder],
					0								as [IsFixedConfiguration],
					null							as [ConfigurationId],
					0								as [IndexStatus],
					0								as [QuoteOption],
					''								as [ImageAltText],
					0								as [LowStockLevel],
					p.ETLSourceID					as ETLSourceId
			FROM	[DM_ECommerce].[dbo].[Product] P 
			JOIN  [dbo].[TradeServicesProduct] TSP ON P.ERPPartNo  = TSP.CustomerItemID
			LEFT JOIN GenericProducts GP ON P.ERPPartNo = GP.CustomerItemId