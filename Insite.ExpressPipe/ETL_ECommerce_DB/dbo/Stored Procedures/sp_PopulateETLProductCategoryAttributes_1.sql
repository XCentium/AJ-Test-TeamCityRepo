

CREATE PROCEDURE [dbo].[sp_PopulateETLProductCategoryAttributes] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLProductCategoryAttributes]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLProductCategoryAttributes] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;
	DECLARE @ErrorMessage as Varchar(max);

	SET XACT_ABORT ON;

		CREATE TABLE #ProdCatAttributeTable
		(
			ProductName varchar(50),
			AttributeName varchar(50),
			AttributeValue varchar(max),
			SortOrder		int	
		)
		CREATE CLUSTERED INDEX IX_1 on #ProdCatAttributeTable (ProductName, AttributeName) 

			INSERT INTO #ProdCatAttributeTable
			SELECT ProductName,
					AttributeName,
					dbo.fn_ScrubData(AttributeValue),
					SortOrder
			 FROM [dbo].[vw_ProductAttributeValues] (NOLOCK) ;

		
		
		/*---------------------------------------------------------------------------------*/
		--				TABLE [AttributeType]	
		/*---------------------------------------------------------------------------------*/
			
			--CLEAN UP TABLE [AttributeType]
			DELETE FROM [dbo].[AttributeType];

			/* INSERT RECORDS INTO ATTRIBUTETYPE TABLE*/
			INSERT INTO [DBO].[ATTRIBUTETYPE]
			   ([ID]
			   ,[NAME]
			   ,[ISACTIVE]
			   ,[LABEL]
			   ,[ISFILTER]
			   ,[ISCOMPARABLE]
			   ,[CREATEDON]
			   ,[CREATEDBY]
			   ,[MODIFIEDON]
			   ,[MODIFIEDBY])
			SELECT 
				NEWID(), 
				PAV.ATTRIBUTENAME,
				1 AS ISACTIVE,
				ATTRIBUTENAME AS LABEL,
				1 AS ISFILTER,
				1 AS ISCOMPARABLE,
				GETDATE() AS CREATEDON,
				@UserName AS CREATEDBY,
				GETDATE() AS MODIFIEDON,
				@UserName AS MODIFIEDBY
			FROM #ProdCatAttributeTable PAV
			Group By PAV.ATTRIBUTENAME


			-- Tap existing Category Product Id from the InsiteExpressPipe CategoryProduct table
			--	and update back to ETL
				Update ETL_AT
				SET ETL_AT.Id = IXP_AT.Id 
				FROM [Insite.Morsco]..AttributeType IXP_AT
				INNER JOIN AttributeType ETL_AT (NOLOCK) 
				  ON (IXP_AT.Name = ETL_AT.Name)
		/*---------------------------------------------------------------------------------*/
		
		/*---------------------------------------------------------------------------------*/
		--					TABLE ATTRIBUTE VALUE 
		/*---------------------------------------------------------------------------------*/
			
			-- CLEAN UP TABLE [AttributeValue]
			TRUNCATE TABLE [dbo].[AttributeValue];
			
			/* INSERT RECORDS INTO ATTRIBUTETYPE TABLE*/
			INSERT INTO [DBO].[ATTRIBUTEVALUE]
				([ID]
				,[ATTRIBUTETYPEID]
				,[VALUE]
				,[SORTORDER]
				,[ISACTIVE]
				,[IMAGEPATH]
				,[CREATEDON]
				,[CREATEDBY]
				,[MODIFIEDON]
				,[MODIFIEDBY])
			SELECT				
				NEWID() ,
				AT.ID				AS ATTRIBUTETYPEID,
				SUBSTRING(PAV.ATTRIBUTEVALUE,1,255) ATTRIBUTEVALUE, --TRUNCATING TO 255 CHARACTERS
				MAX(PAV.SortOrder)	AS SORTORDER,
				1					AS ISACTIVE,
				''					AS IMAGEPATH,
				GETDATE()			AS CREATEDON,
				@UserName			AS CREATEDBY,
				GETDATE()			AS MODIFIEDON,
				@UserName			AS MODIFIEDBY
			FROM #ProdCatAttributeTable PAV
			INNER JOIN [dbo].[AttributeType] AT (NOLOCK)  ON AT.Name = PAV.AttributeName 
			GROUP BY AT.ID, PAV.ATTRIBUTEVALUE

			-- Tap existing [AttributeValue] Id from the InsiteExpressPipe [AttributeValue] table
			--	and update back to ETL
					UPDATE ETL_AV
					   SET ETL_AV.ID = IXP_AV.ID 
					  FROM [Insite.Morsco]..ATTRIBUTEVALUE IXP_AV
				INNER JOIN ATTRIBUTEVALUE ETL_AV (NOLOCK) 
						ON (IXP_AV.ATTRIBUTETYPEID = ETL_AV.ATTRIBUTETYPEID
					   AND IXP_AV.VALUE = ETL_AV.VALUE)
		/*---------------------------------------------------------------------------------*/


		/*---------------------------------------------------------------------------------*/
		--					TABLE PRODUCT ATTRIBUTE VALUE 
		/*---------------------------------------------------------------------------------*/
			
			--CLEAN UP FOR TABLE [ProductAttributeValue]
			TRUNCATE TABLE [dbo].[ProductAttributeValue];

			-- INSERT [PRODUCTATTRIBUTEVALUE] RECORDS
			INSERT INTO 
				[DBO].[PRODUCTATTRIBUTEVALUE]
				([PRODUCTID]
				,[ATTRIBUTEVALUEID])
			SELECT P.ID PRODUCTID,
					AV.Id ATTRIBUTEVALUEID
				FROM #ProdCatAttributeTable PAV
				INNER JOIN PRODUCT P (NOLOCK) ON P.NAME = PAV.PRODUCTNAME
				INNER JOIN AttributeValue AV (NOLOCK)  ON AV.Value = PAV.AttributeValue
				INNER JOIN AttributeType AT (NOLOCK) ON AT.Name = PAV.AttributeName AND AT.Id = AV.AttributeTypeId
				GROUP BY P.ID, AV.Id
			
		/*---------------------------------------------------------------------------------*/
		--				TABLE CATEGORY ATTRIBUTE 	
		/*---------------------------------------------------------------------------------*/

			-- CLEAN UP FOR TABLE [CategoryAttributeType]
			TRUNCATE TABLE [dbo].[CategoryAttributeType];

			WITH CTE AS
			(
				 SELECT 
						ROW_NUMBER() OVER (PARTITION BY C.ID, AT.ID ORDER BY PAV.SortOrder DESC) Row,
						C.ID				AS CATEGORYID,
						AT.Id				AS ATTRIBUTETYPEID, 
						PAV.SortOrder		AS SORTORDER
				  FROM	#ProdCatAttributeTable PAV
			INNER JOIN  PRODUCT P (NOLOCK) ON P.NAME = PAV.PRODUCTNAME
			INNER JOIN  AttributeType AT (NOLOCK)  ON AT.Name = PAV.AttributeName
			INNER JOIN  [dbo].[TradeServicesProduct] TSC (NOLOCK)  ON P.NAME = TSC.[CUSTOMERITEMID]
			INNER JOIN  Category C (NOLOCK)  ON TSC.FullPath = C.Path
			)
			-- INSERT [CATEGORYATTRIBUTETYPE] RECORDS 
			INSERT INTO [DBO].[CATEGORYATTRIBUTETYPE]
					([ID]
					,[CATEGORYID]
					,[ATTRIBUTETYPEID]
					,[SORTORDER]
					,[ISACTIVE]
					,[DETAILDISPLAYSEQUENCE]
					,[CREATEDON]
					,[CREATEDBY]
					,[MODIFIEDON]
					,[MODIFIEDBY])
			SELECT  NEWID(),
					CATEGORYID,
					ATTRIBUTETYPEID, 
					SORTORDER,
					1					AS ISACTIVE,
					NULL				AS [DETAILDISPLAYSEQUENCE],
					GETDATE()			AS CREATEDON,
					@UserName			AS CREATEDBY,
					GETDATE()			AS MODIFIEDON,
					@UserName			AS MODIFIEDBY
			FROM CTE 
			WHERE Row = 1

			/*---------------------------------------------------------------------------------*/
			-- Look for existing records in Insite Database and update them back to ETL Tables
			/*---------------------------------------------------------------------------------*/
			
				UPDATE ETL_CAT
					SET ETL_CAT.ID = IXP_CAT.ID 
					FROM [Insite.Morsco]..CategoryAttributeType IXP_CAT
			INNER JOIN CategoryAttributeType ETL_CAT (NOLOCK) 
					ON (IXP_CAT.ATTRIBUTETYPEID = ETL_CAT.ATTRIBUTETYPEID
					AND IXP_CAT.CategoryId = ETL_CAT.CategoryId)
		/*---------------------------------------------------------------------------------*/
END