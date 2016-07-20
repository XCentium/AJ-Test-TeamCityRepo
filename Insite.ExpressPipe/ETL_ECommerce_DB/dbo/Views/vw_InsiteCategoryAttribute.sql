





-- Attribute view
-- [CUSTOMER_Item ID] is product Name which is unique in Insite
CREATE VIEW [dbo].[vw_InsiteCategoryAttribute] AS
	
			WITH TSCat as
				(
					SELECT DISTINCT dbo.fn_GetCategoryFullPathTradeServices(CustomerItemID) FullPath, * FROM vw_TradeServicesProduct
				),
				ETLCat as
				(
					SELECT dbo.fn_GetCategoryFullPathETL(c.id) FullPath,* FROM Category c
				),
				InsiteCat as
				(
					SELECT dbo.fn_GetCategoryFullPathInsite(c.id) FullPath,* FROM Category c
				)
			
				SELECT distinct
					C.Id CategoryId,
					At.id AttributeTypeId, 
					CAT.Id CategoryAttributeId,
					At.name as AttributeName, 		
					C.Name CategoryName
				FROM [insite.expresspipe]..AttributeType AT
				INNER JOIN [insite.expresspipe]..CategoryAttributeType CAT
				ON AT.Id = CAT.AttributeTypeId
				INNER JOIN InsiteCat C
				ON C.Id = CAT.CategoryId
				INNER JOIN TSCat TSC
				ON TSC.FullPath = C.FullPath