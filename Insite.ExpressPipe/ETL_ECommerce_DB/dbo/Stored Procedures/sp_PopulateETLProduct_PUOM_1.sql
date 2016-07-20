

CREATE PROCEDURE [dbo].[sp_PopulateETLProduct_PUOM] 
	@ETLSourceId Varchar(50),
	@UserName		Varchar(50)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLProduct_PUOM]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLProduct_PUOM] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	DECLARE @ErrorMessage VARCHAR(100);

	SET XACT_ABORT ON;

--************************************************************************************************************************#
--					Table [Product] - Data Population
--************************************************************************************************************************#
			 TRUNCATE TABLE [Product];

			 ;WITH ProductHasDupRows AS --If Product has duplicate rows, then pick then first product row
			 (
				SELECT ROW_NUMBER() OVER(PARTITION BY Name ORDER BY Name, ETLSourceId DESC) AS DuplicateRow, 
					   *
				  FROM vw_ProductData where ETLSourceId = @ETLSourceId
			 )

--**************************************************************************************************************************************=
-- Load Trade Services Product data
--**************************************************************************************************************************************=
			-- Insert statements for procedure here
			 INSERT INTO [Product]
					([Id], --Uniqueidentifier will be generated automatically..
					[Name]
					,[ShortDescription]
					,[ERPDescription]
					,[ProductCode]
					,[PriceCode]
					,[UnitOfMeasure]
					,[Sku]
					,[SmallImagePath]
					,[MediumImagePath]
					,[LargeImagePath]
					,[Drawing]
					,[ActivateOn]
					--,[DeactivateOn]
					,[SortOrder]
					,[TaxCode1]
					,[TaxCode2]
					,[ShippingWeight]
					,[ShippingLength]
					,[ShippingWidth]
					,[ShippingHeight]
					,[ShippingAmountOverride]
					,[QtyPerShippingPackage]
					,[MetaKeywords]
					,[MetaDescription]
					,[PageTitle]
					,[ShippingClassification]
					,[PackDescription]
					,[DisplayPricePerPiece]
					,[UnitCost]
					,[UrlSegment]
					,[ContentManagerId]
					,[IsGiftCard]
					,[AllowAnyGiftCardAmount]
					,[ERPNumber]
					,[IsOutOfStock]
					,[UPCCode]
					,[ERPManaged]
					,[DocumentManagerId]
					,[ModelNumber]
					,[HandlingAmountOverride]
					,[IsSubscription]
					,[SubscriptionCyclePeriod]
					,[SubscriptionPeriodsPerCycle]
					,[SubscriptionTotalCycles]
					,[SubscriptionFixedPrice]
					,[SubscriptionAddToInitialOrder]
					,[SubscriptionShipViaId]
					,[SubscriptionAllMonths]
					,[SubscriptionJanuary]
					,[SubscriptionFebruary]
					,[SubscriptionMarch]
					,[SubscriptionApril]
					,[SubscriptionMay]
					,[SubscriptionJune]
					,[SubscriptionJuly]
					,[SubscriptionAugust]
					,[SubscriptionSeptember]
					,[SubscriptionOctober]
					,[SubscriptionNovember]
					,[SubscriptionDecember]
					,[VendorId]
					,[PriceBasis]
					,[UseVendorMarkup]
					,[TrackInventory]
					,[IsConfigured]
					,[Configuration]
					,[TaxCategory]
					,[BasicListPrice]
					,[BasicSalePrice]
					,[BasicSaleStartDate]
					,[BasicSaleEndDate]
					,[StyleClassId]
					,[StyleParentId]
					,[SearchLookup]
					,[RestrictionGroupId]
					,[ReplacementProductId]
					,[HasMsds]
					,[IsHazardousGood]
					,[IsDiscontinued]
					,[ManufacturerItem]
					,[RoundingRule]
					,[MultipleSaleQty]
					,[Unspsc]
					,[IsSpecialOrder]
					,[IsFixedConfiguration]
					,[ConfigurationId]
					,[IndexStatus]
					,[QuoteOption]
					,[ImageAltText]
					,[LowStockLevel]
					,[CreatedOn]
					,[CreatedBy]
					,[ModifiedOn]
					,[ModifiedBy])
	 		  
			  SELECT  Newid() Id,
				      [Name]
					  ,COALESCE(NULLIF([ShortDescription],''), ISNULL(ErpDescription,''))
					  ,[ERPDescription]
					  ,[ProductCode]
					  ,[PriceCode]
					  ,[UnitOfMeasure]
					  ,[Sku]
					  ,[SmallImagePath]
					  ,[MediumImagePath]
					  ,[LargeImagePath]
					  ,[Drawing] 
					  ,GETDATE()
					 -- ,null
					  ,[SortOrder]
					  ,[TaxCode1]
					  ,[TaxCode2]
					  ,[ShippingWeight]
					  ,[ShippingWidth]
					  ,[ShippingLength]
					  ,[ShippingHeight]
					  ,[ShippingAmountOverride]
					  ,[QtyPerShippingPackage]
					  ,[MetaKeywords]
					  ,[MetaDescription]
					  ,[PageTitle]
					  ,[ShippingClassification]
					  ,[PackDescription]
					  ,[DisplayPricePerPiece]
					  ,ISNULL([UnitCost],0)
					  ,[UrlSegment]
					  ,null [ContentManagerId]
					  ,[IsGiftCard]
					  ,[AllowAnyGiftCardAmount]
					  ,[ERPNumber]
					  ,[IsOutOfStock]
					  ,[UPCCode]
					  ,[ERPManaged]
					  ,null [DocumentManagerId]
					  ,[ModelNumber]
					  ,[HandlingAmountOverride]
					  ,[IsSubscription]
					  ,[SubscriptionCyclePeriod]
					  ,[SubscriptionPeriodsPerCycle]
					  ,[SubscriptionTotalCycles]
					  ,[SubscriptionFixedPrice]
					  ,[SubscriptionAddToInitialOrder]
					  ,null [SubscriptionShipViaId]
					  ,[SubscriptionAllMonths]
					  ,[SubscriptionJanuary]
					  ,[SubscriptionFebruary]
					  ,[SubscriptionMarch]
					  ,[SubscriptionApril]
					  ,[SubscriptionMay]
					  ,[SubscriptionJune]
					  ,[SubscriptionJuly]
					  ,[SubscriptionAugust]
					  ,[SubscriptionSeptember]
					  ,[SubscriptionOctober]
					  ,[SubscriptionNovember]
					  ,[SubscriptionDecember]
					  ,null [VendorId]
					  ,[PriceBasis]
					  ,[UseVendorMarkup]
					  ,[TrackInventory]
					  ,[IsConfigured]
					  ,[Configuration]
					  ,[TaxCategory]
					  ,[BasicListPrice]
					  ,[BasicSalePrice]
					  ,NULL 
					  ,null
					  ,null [StyleClassId]
					  ,null [StyleParentId]
					  ,[SearchLookup]
					  ,null [RestrictionGroupId]
					  ,null [ReplacementProductId]
					  ,[HasMsds]
					  ,[IsHazardousGood]
					  ,[IsDiscontinued]
					  ,[ManufacturerItem]
					  ,[RoundingRule]
					  ,[MultipleSaleQty]
					  ,[Unspsc]
					  ,[IsSpecialOrder]
					  ,[IsFixedConfiguration]
					  ,null [ConfigurationId]
					  ,[IndexStatus]
					  ,[QuoteOption]
					  ,[ImageAltText]
					  ,[LowStockLevel]
					  ,GETDATE()
					  ,@UserName
					  ,GETDATE()
					  ,@UserName
				 FROM  ProductHasDupRows P
				WHERE  P.DuplicateRow = 1

--**************************************************************************************************************************************=
-- Load NON Trade Services Product data
--**************************************************************************************************************************************=
			
			--*****NOTE: Temporarily commenting NON Trade Services Prodcuts as per client request*****

			;WITH NonTSPDuplicateRows AS --If Product has duplicate rows, then pick then first product row
			 (
				SELECT ROW_NUMBER() OVER(PARTITION BY Name ORDER BY Name, ProductCode DESC) AS Row, 
					   *
				  FROM [dbo].[vw_NonTradeServiceProductData] where ETLSourceId = @ETLSourceId
			 )

				INSERT INTO [Product](
						[Id]
					  ,[Name]
					  ,[ShortDescription]
					  ,[ERPDescription]
					  ,[ProductCode]
					  ,[PriceCode]
					  ,[UnitOfMeasure]
					  ,[SKU]
					  ,[SmallImagePath]
					  ,[MediumImagePath]
					  ,[LargeImagePath]
					  ,[Drawing]
					  ,[ActivateOn]
					  ,[DeactivateOn]
					  ,[SortOrder]
					  ,[TaxCode1]
					  ,[TaxCode2]
					  ,[ShippingWeight]
					  ,[ShippingLength]
					  ,[ShippingWidth]
					  ,[ShippingHeight]
					  ,[ShippingAmountOverride]
					  ,[QtyPerShippingPackage]
					  ,[MetaKeywords]
					  ,[MetaDescription]
					  ,[PageTitle]
					  ,[ShippingClassification]
					  ,[PackDescription]
					  ,[DisplayPricePerPiece]
					  ,[UnitCost]
					  ,[UrlSegment]
					  ,[ContentManagerId]
					  ,[IsGiftCard]
					  ,[AllowAnyGiftCardAmount]
					  ,[ERPNumber]
					  ,[IsOutOfStock]
					  ,[UPCCode]
					  ,[ERPManaged]
					  ,[DocumentManagerId]
					  ,[ModelNumber]
					  ,[HandlingAmountOverride]
					  ,[IsSubscription]
					  ,[SubscriptionCyclePeriod]
					  ,[SubscriptionPeriodsPerCycle]
					  ,[SubscriptionTotalCycles]
					  ,[SubscriptionFixedPrice]
					  ,[SubscriptionAddToInitialOrder]
					  ,[SubscriptionShipViaId]
					  ,[SubscriptionAllMonths]
					  ,[SubscriptionJanuary]
					  ,[SubscriptionFebruary]
					  ,[SubscriptionMarch]
					  ,[SubscriptionApril]
					  ,[SubscriptionMay]
					  ,[SubscriptionJune]
					  ,[SubscriptionJuly]
					  ,[SubscriptionAugust]
					  ,[SubscriptionSeptember]
					  ,[SubscriptionOctober]
					  ,[SubscriptionNovember]
					  ,[SubscriptionDecember]
					  ,[VendorId]
					  ,[PriceBasis]
					  ,[UseVendorMarkup]
					  ,[TrackInventory]
					  ,[IsConfigured]
					  ,[Configuration]
					  ,[TaxCategory]
					  ,[BasicListPrice]
					  ,[BasicSalePrice]
					  ,[BasicSaleStartDate]
					  ,[BasicSaleEndDate]
					  ,[StyleClassId]
					  ,[StyleParentId]
					  ,[SearchLookup]
					  ,[RestrictionGroupId]
					  ,[ReplacementProductId]
					  ,[HasMsds]
					  ,[IsHazardousGood]
					  ,[IsDiscontinued]
					  ,[ManufacturerItem]
					  ,[RoundingRule]
					  ,[MultipleSaleQty]
					  ,[Unspsc]
					  ,[IsSpecialOrder]
					  ,[IsFixedConfiguration]
					  ,[ConfigurationId]
					  ,[IndexStatus]
					  ,[QuoteOption]
					  ,[ImageAltText]
					  ,[LowStockLevel]
					  ,CreatedOn
					  ,CreatedBy
					  ,ModifiedOn
					  ,ModifiedBy
					  )
				SELECT NEWID() ID 
					  ,[Name]
					  ,COALESCE(NULLIF([ShortDescription],''), ISNULL(ErpDescription,''))
					  ,[ERPDescription]
					  ,[ProductCode]
					  ,[PriceCode]
					  ,[UnitOfMeasure]
					  ,[SKU]
					  ,[SmallImagePath]
					  ,[MediumImagePath]
					  ,[LargeImagePath]
					  ,[Drawing]
					  ,GETDATE() --[ActivateOn]
					  ,NULL -- GETDATE() -- [DeactivateOn]			-- All Non TSP Products should be deactivated for now
					  ,[SortOrder]
					  ,[TaxCode1]
					  ,[TaxCode2]
					  ,[ShippingWeight]
					  ,[ShippingLength]
					  ,[ShippingWidth]
					  ,[ShippingHeight]
					  ,[ShippingAmountOverride]
					  ,[QtyPerShippingPackage]
					  ,[MetaKeywords]
					  ,[MetaDescription]
					  ,[PageTitle]
					  ,[ShippingClassification]
					  ,[PackDescription]
					  ,[DisplayPricePerPiece]
					  ,[UnitCost]
					  ,[UrlSegment]
					  ,NULL [ContentManagerId]				-- UniqueIdentifier
					  ,[IsGiftCard]
					  ,[AllowAnyGiftCardAmount]
					  ,[ERPNumber]
					  ,[IsOutOfStock]
					  ,[UPCCode]
					  ,[ERPManaged]
					  ,NULL [DocumentManagerId]				-- UniqueIdentifier
					  ,[ModelNumber]
					  ,[HandlingAmountOverride]
					  ,[IsSubscription]
					  ,[SubscriptionCyclePeriod]
					  ,[SubscriptionPeriodsPerCycle]
					  ,[SubscriptionTotalCycles]
					  ,[SubscriptionFixedPrice]
					  ,[SubscriptionAddToInitialOrder]
					  ,NULL [SubscriptionShipViaId]			-- UniqueIdentifier
					  ,[SubscriptionAllMonths]
					  ,[SubscriptionJanuary]
					  ,[SubscriptionFebruary]
					  ,[SubscriptionMarch]
					  ,[SubscriptionApril]
					  ,[SubscriptionMay]
					  ,[SubscriptionJune]
					  ,[SubscriptionJuly]
					  ,[SubscriptionAugust]
					  ,[SubscriptionSeptember]
					  ,[SubscriptionOctober]
					  ,[SubscriptionNovember]
					  ,[SubscriptionDecember]
					  ,NULL [VendorId]						-- UniqueIdentifier
					  ,[PriceBasis]
					  ,[UseVendorMarkup]
					  ,[TrackInventory]
					  ,[IsConfigured]
					  ,[Configuration]
					  ,[TaxCategory]
					  ,[BasicListPrice]
					  ,[BasicSalePrice]
					  ,NULL --[BasicSaleStartDate]							-- Date COlumn
					  ,NULL --[BasicSaleEndDate]			-- Date COlumn
					  ,NULL [StyleClassId]						-- UniqueIdentifier
					  ,NULL [StyleParentId]						-- UniqueIdentifier
					  ,[SearchLookup]
					  ,NULL [RestrictionGroupId]			-- UniqueIdentifier
					  ,NULL [ReplacementProductId]			-- UniqueIdentifier
					  ,[HasMsds]
					  ,[IsHazardousGood]
					  ,'' [IsDiscontinued]					--All Non TSP should be considered like discontinued products for now
					  ,[ManufacturerItem]
					  ,[RoundingRule]
					  ,[MultipleSaleQty]
					  ,[Unspsc]
					  ,[IsSpecialOrder]
					  ,[IsFixedConfiguration]
					  ,NULL [ConfigurationId]				-- UniqueIdentifier
					  ,[IndexStatus]
					  ,[QuoteOption]
					  ,[ImageAltText]
					  ,[LowStockLevel]
					  ,GETDATE() as CreatedOn
					  ,@UserName as CreatedBy
					  ,GetDate() as ModifiedOn
					  ,@UserName as ModifiedBy
				  FROM NonTSPDuplicateRows
				  where Row = 1

			--***********************************************************************************************************************
			-- Check for the existing IDs in Insite DB
			--***********************************************************************************************************************
			/*Checking for the existing Product Records in Insite ExpressPipe(Target) 
			with the same data if so ProductId in ETL(source) will need to be updated*/		    
				UPDATE ETL_P
				   SET Id = IXP_P.Id,
						ActivateOn = IXP_P.ActivateOn,
						BasicSaleStartDate = IXP_P.BasicSaleStartDate
				  FROM [Insite.Morsco]..Product IXP_P
				  JOIN ETL_ECommerce..Product ETL_P (NOLOCK) 
				    ON IXP_P.ERPNumber = ETL_P.ERPNumber	

				--*****************************************************************************************************************
				--					TABLE [DocumentManager]
				--*****************************************************************************************************************
				--TRUNCATE TABLE [dbo].[DocumentManager];
				DELETE FROM [dbo].[DocumentManager];

				INSERT INTO [dbo].[DocumentManager]
			   ([Id]
			   ,[Name]
			   ,[CreatedOn]
			   ,[CreatedBy]
			   ,[ModifiedOn]
			   ,[ModifiedBy])
 					SELECT	NEWID(),
							Name,
							GETDATE() as CreatedOn,
							@UserName as CreatedBy,
							GetDate() as ModifiedOn,
							@UserName as ModifiedBy
					FROM PRODUCT (NOLOCK) 

			-- Update Existing IDs from Insite DB
			UPDATE EDM SET EDM.Id = IDM.Id
			FROM DocumentManager EDM 
			JOIN [Insite.Morsco]..DocumentManager IDM (NOLOCK) ON EDM.Name = IDM.Name AND EDM.Id <> IDM.Id
			
			--*************************************************************************************************************
			--				UPDATE PRODUCT.DOCUMENTMANAGERID WITH THE DOCUMENT MANAGER DETAILS
			--*************************************************************************************************************
			Update P 
				SET P.DocumentManagerId = DM.Id
			FROM Product P
				INNER JOIN DocumentManager DM
					ON (P.ERPNumber = DM.Name)

			--***************************************************************************************************************
			--					Table [ProductUnitOfMeasure] - Data Population
			--***************************************************************************************************************
			TRUNCATE TABLE [dbo].[ProductUnitOfMeasure];

			INSERT INTO [dbo].[ProductUnitOfMeasure]
				   ([Id]
				   ,[ProductId]
				   ,[UnitOfMeasure]
				   ,[Description]
				   ,[QtyPerBaseUnitOfMeasure]
				   ,[RoundingRule]
				   ,[IsDefault]
				   ,[CreatedOn]
				   ,[CreatedBy]
				   ,[ModifiedOn]
				   ,[ModifiedBy])
     
			 SELECT NEWID() as Id
					,ProductId
					,BaseUnitOfMeasure as UnitOfMeasure
					,BaseUnitOfMeasure as Description
					,1 as [QtyPerBaseUnitOfMeasure]
					,'' as [RoundingRule]
					,1 as IsDefault
					,GETDATE() as CreatedOn
					,@UserName as CreatedBy
					,GETDATE() as ModifiedOn
					,@UserName as ModifiedBy
				FROM 
					(SELECT 
						DISTINCT 
						iep.Id ProductId, 
						ERPPartNo, 
						[BaseUnitOfMeasure]
					FROM [DM_ECommerce].[dbo].[Product] dmp (NOLOCK) 
						INNER JOIN Product iep (NOLOCK) 
							ON (dmp.ERPPartNo = iep.Name)
							where dmp.ETLSourceID = @ETLSourceId
							) as PUOM

			/*Checking for the existing Product Records in Insite ExpressPipe(Target) 
			with the same data if so ProductId in ETL(source) will need to be updated*/		    
				UPDATE ETL_PUOM
				   SET Id = IXP_PUOM.Id
				  FROM [Insite.Morsco]..ProductUnitOfMeasure IXP_PUOM
				  JOIN ETL_ECommerce..ProductUnitOfMeasure ETL_PUOM (NOLOCK) 
				    ON IXP_PUOM.ProductId = ETL_PUOM.ProductId AND IXP_PUOM.[UnitOfMeasure] = ETL_PUOM.[UnitOfMeasure]

END