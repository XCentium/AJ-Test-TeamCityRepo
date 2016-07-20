
CREATE VIEW [dbo].[vw_ProductGenericData] AS
			 SELECT 
					PG.CustomerItemId PG_CustomerItemId 
					,PG.CustomerDescription PG_CustomerDescription
					,PG.CustomerManufacturerPartNumber  PG_CustomerManufacturerPartNumber
					,PG.ManufacturerName PG_ManufacturerName
					,IsGenericProduct
					,[GenericSKU]
					,[XrefSKU]
					,[GenericProductFamilyCode]
					,[DisplayOrder]
					,[VariantDimension]
					,[ValueOfVariant]
					,TSP.*
			  FROM  TradeServicesProduct TSP
   LEFT OUTER JOIN  ProductGeneric PG ON PG.CustomerItemId = TSP.CustomerItemID