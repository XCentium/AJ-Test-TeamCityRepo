
CREATE PROCEDURE [dbo].[sp_PopulateETLProduct_PUOM] 
	@ETLSourceId Varchar(50),
	@UserName		Varchar(50)
AS
BEGIN

	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	DECLARE @ErrorMessage VARCHAR(100);

	BEGIN TRY
		BEGIN TRANSACTION

--#########################################################################################################################
--					Table [Product] - Data Population
--#########################################################################################################################
			 TRUNCATE TABLE [Product];

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
					  , [BasicSalePrice]
					  ,GETDATE()
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
				 FROM  [dbo].[vw_ProductData]
				WHERE  ETLSourceId = @ETLSourceId

			/*Checking for the existing Product Records in Insite ExpressPipe(Target) 
			with the same data if so ProductId in ETL(source) will need to be updated*/		    
				UPDATE ETL_P
				   SET Id = IXP_P.Id,
						--ContentManagerId = IXP_P.ContentManagerId,
						--DocumentManagerId = IXP_P.DocumentManagerId,
						ActivateOn = IXP_P.ActivateOn,
						BasicSaleStartDate = IXP_P.BasicSaleStartDate
				  FROM [Insite.expresspipe]..Product IXP_P
				  JOIN ETL_ECommerce..Product ETL_P 
				    ON IXP_P.ERPNumber = ETL_P.ERPNumber	

--#########################################################################################################################
--					Table [ProductUnitOfMeasure] - Data Population
--#########################################################################################################################
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
					FROM [DM_ECommerce].[dbo].[Product] dmp
						INNER JOIN Product iep
							ON (dmp.ERPPartNo = iep.Name)
							where dmp.ETLSourceID = @ETLSourceId
							) as PUOM

			/*Checking for the existing Product Records in Insite ExpressPipe(Target) 
			with the same data if so ProductId in ETL(source) will need to be updated*/		    
				UPDATE ETL_PUOM
				   SET Id = IXP_PUOM.Id
				  FROM [Insite.expresspipe]..ProductUnitOfMeasure IXP_PUOM
				  JOIN ETL_ECommerce..ProductUnitOfMeasure ETL_PUOM 
				    ON IXP_PUOM.ProductId = ETL_PUOM.ProductId

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;
END