









CREATE VIEW [dbo].[vw_NonTradeServiceProductData] AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This View pulls all the products compatible with 
--				TradeServiceProduct data and Product data in the DM_ECommerce table
-- =============================================
		  SELECT	DP.ETLSourceId
					,ISNULL(DP.[ERPPartNo],'') as Name
					,'' [ShortDescription]
					,dbo.fn_ScrubData2(SUBSTRING(ISNULL(DP.[LongDescription],''),1,2048)) as [ERPDescription]
					,ISNULL(DP.[ProductCode],'') as [ProductCode]
					,ISNULL(DP.[PriceCode],'') [PriceCode]
					,ISNULL(DP.[BaseUnitOfMeasure],'') as [UnitOfMeasure]
					,ISNULL(DP.[ManufacturerPartNumber],'') SKU
					,'/userfiles/images/products/sm_notfound.jpg' [SmallImagePath]
					,'/userfiles/images/products/md_notfound.jpg' [MediumImagePath]
					,'/userfiles/images/products/lg_notfound.jpg'  [LargeImagePath]
					,'' [Drawing]
					,GETDATE() [ActivateOn]
					,NULL [DeactivateOn]
					,0 [SortOrder]
					,'' [TaxCode1]
					,'' [TaxCode2]
					,ISNULL(DP.[UnitWeight],0)	[ShippingWeight]
					,ISNULL(DP.[UnitLength],0)	[ShippingLength]
					,ISNULL(DP.[UnitWidth],0)	[ShippingWidth]
					,ISNULL(DP.[UnitHeight],0)	[ShippingHeight]
					,0 [ShippingAmountOverride]
					,0 [QtyPerShippingPackage]
					,dbo.fn_ScrubData2(ISNULL(DP.[Metadata],'')) as [MetaKeywords]
					,'' [MetaDescription]
					,dbo.fn_ScrubData2(ISNULL(DP.[Metadata],'')) as [PageTitle]
					,'' [ShippingClassification]
					,'' [PackDescription]
					,0 [DisplayPricePerPiece]
					,ISNULL(DP.[UnitCost],0) as [UnitCost]
					,ISNULL(DP.[ERPPartNo],'') as [UrlSegment]
					,NULL as [ContentManagerId]
					,0 [IsGiftCard]
					,0 [AllowAnyGiftCardAmount]
					,ISNULL(DP.[ERPPartNo],'') as ERPNumber 
					,0 [IsOutOfStock]
					,ISNULL(DP.[UPC],'') as [UPCCode]
					,0 [ERPManaged]
					,NULL  [DocumentManagerId]
					,CASE 
						WHEN IsGenericProduct = 'Y' THEN '' 
						ELSE ISNULL(TSP.ManufacturerPartNumber,'')		
					END [ModelNumber]
					,0 [HandlingAmountOverride]
					,0 [IsSubscription]
					,'' [SubscriptionCyclePeriod]
					,0 [SubscriptionPeriodsPerCycle]
					,0 [SubscriptionTotalCycles]
					,0 [SubscriptionFixedPrice]
					,0 [SubscriptionAddToInitialOrder]
					,Null  [SubscriptionShipViaId]
					,0 [SubscriptionAllMonths]
					,0 [SubscriptionJanuary]
					,0 [SubscriptionFebruary]
					,0 [SubscriptionMarch]
					,0 [SubscriptionApril]
					,0 [SubscriptionMay]
					,0 [SubscriptionJune]
					,0 [SubscriptionJuly]
					,0 [SubscriptionAugust]
					,0 [SubscriptionSeptember]
					,0 [SubscriptionOctober]
					,0 [SubscriptionNovember]
					,0 [SubscriptionDecember]
					,NULL [VendorId]
					,'' [PriceBasis]
					,0 [UseVendorMarkup]
					,0 [TrackInventory]
					,0 [IsConfigured]
					,'' [Configuration]
					,'' [TaxCategory]
					,ISNULL(DP.[BaseListPrice],0) as [BasicListPrice]
					,0 [BasicSalePrice]
					,GETDATE() [BasicSaleStartDate]
					,NULL [BasicSaleEndDate]
					,NULL [StyleClassId]
					,NULL [StyleParentId]
					,'' [SearchLookup]
					,NULL [RestrictionGroupId]
					,NULL [ReplacementProductId]
					,0 [HasMsds]
					,0 [IsHazardousGood]
					,0 [IsDiscontinued]
					,CASE 
						WHEN IsGenericProduct = 'Y' THEN '' 
						ELSE ISNULL(TSP.ManufacturerPartNumber,'')		
					END [ManufacturerItem]
					,'' [RoundingRule]
					,0 [MultipleSaleQty]
					,'' [Unspsc]
					,0 [IsSpecialOrder]
					,0  [IsFixedConfiguration]
					,NULL  [ConfigurationId]
					,0 [IndexStatus]
					,0 [QuoteOption]
					,'' [ImageAltText]
					,0 [LowStockLevel]
					,ISNULL(DP.[Stock_NonStock],'') AS [Stock_NonStock]
					,ISNULL(DP.ManufacturerName,'') as ManufacturerName
			FROM	[DM_ECommerce].[dbo].[Product] DP
			LEFT JOIN	[TradeServicesProduct] TSP ON TSP.[CustomerItemID] = DP.[ERPPartNo]
			LEFT JOIN GenericProducts GP ON DP.ERPPartNo = GP.CustomerItemId
			WHERE	TSP.[CustomerItemID] is null