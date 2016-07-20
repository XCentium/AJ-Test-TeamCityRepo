





-- Attribute view
-- [CUSTOMER_Item ID] is product Name which is unique in Insite
CREATE VIEW [dbo].[vw_ProductCategoryAttributeValues] AS
	
	WITH TSCat as
	(
		SELECT DISTINCT dbo.fn_GetCategoryFullPathTradeServices(CustomerItemID) FullPath, *
		FROM vw_TradeServicesProduct

	),
	ETLCat as
	(
		SELECT 
			dbo.fn_GetCategoryFullPathETL(c.id) FullPath,
			*
		FROM Category c
	)

		SELECT P.ID PRODUCTID,
			P.Name ProductName, 
			NEWID() ATTRIBUTETYPEID, 
			PAV.AttributeName ATTRIBUTENAME, 
			NEWID() ATTRIBUTEVALUEID, 
			SUBSTRING(ATTRIBUTEVALUE,1,255) ATTRIBUTEVALUE,
			NEWID() CATEGORYATTRIBUTEID,
			C.ID,
			C.NAME 
		FROM [VW_PRODUCTATTRIBUTEVALUES] PAV
		INNER JOIN PRODUCT P
		ON P.NAME = CAST(PAV.PRODUCTNAME as nvarchar(20))
		INNER JOIN TSCat TSC
		ON P.NAME = CAST(TSC.[CUSTOMERITEMID] as nvarchar(20))
		INNER JOIN ETLCat C
		ON TSC.FullPath = C.FullPath