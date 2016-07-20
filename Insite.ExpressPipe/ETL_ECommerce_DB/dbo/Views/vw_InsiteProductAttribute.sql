





-- Attribute view
-- [CUSTOMER_Item ID] is product Name which is unique in Insite
CREATE VIEW [dbo].[vw_InsiteProductAttribute] AS
	
			WITH TSCat as
			(
				SELECT DISTINCT dbo.fn_GetCategoryFullPathTradeServices(CustomerItemID) FullPath, * FROM vw_TradeServicesProduct
			),
			InsiteCat as
			(
				SELECT dbo.fn_GetCategoryFullPathInsite(c.id) FullPath,* FROM Category c
			)
			
			SELECT 
				P.id ProductId, 
				At.id AttributeTypeId, 
				AV.id AttributeValueId, 
				C.Id CategoryId,
				P.Name ProductName, 
				At.name as AttributeName, 		
				AV.Value AttributeValue, 
				C.Name CategoryName
				
			FROM 
			[insite.expresspipe]..Product P
			INNER JOIN [insite.expresspipe]..ProductAttributeValue PAV
			ON P.Id = PAV.ProductId
			INNER JOIN [insite.expresspipe]..AttributeValue AV
			ON AV.Id = PAV.AttributeValueId
			INNER JOIN [insite.expresspipe]..AttributeType AT
			ON AT.Id = AV.AttributeTypeId
			INNER JOIN TSCat TSC
			ON P.NAME = CAST(TSC.[CUSTOMERITEMID] as nvarchar(20))
			INNER JOIN INSITECat C
			ON TSC.FullPath = C.FullPath