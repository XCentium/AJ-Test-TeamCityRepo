

CREATE PROCEDURE [dbo].[sp_PopulateETLProductCategoryAttributes] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This Procedure is created to populate the AttributeType, 
--				Value, Product Attribute and Category Attribute Tables
--				 Morsco.com ECLIPSE DB --> ETL DB
-- =============================================
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	SET NOCOUNT ON;
	DECLARE @ErrorMessage as Varchar(max);

	BEGIN TRY
		BEGIN TRANSACTION

		
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
			FROM VW_PRODUCTATTRIBUTEVALUES PAV
			Group By PAV.ATTRIBUTENAME


			-- Tap existing Category Product Id from the InsiteExpressPipe CategoryProduct table
			--	and update back to ETL
				Update ETL_AT
				SET ETL_AT.Id = IXP_AT.Id 
				FROM [insite.expresspipe]..AttributeType IXP_AT
				INNER JOIN AttributeType ETL_AT
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
			FROM vw_ProductAttributeValues PAV
			INNER JOIN [dbo].[AttributeType] AT
			ON AT.Name = PAV.AttributeName 
			GROUP BY AT.ID, PAV.ATTRIBUTEVALUE

			-- Tap existing [AttributeValue] Id from the InsiteExpressPipe [AttributeValue] table
			--	and update back to ETL
					UPDATE ETL_AV
					   SET ETL_AV.ID = IXP_AV.ID 
					  FROM [INSITE.EXPRESSPIPE]..ATTRIBUTEVALUE IXP_AV
				INNER JOIN ATTRIBUTEVALUE ETL_AV
						ON (IXP_AV.ATTRIBUTETYPEID = ETL_AV.ATTRIBUTETYPEID
					   AND IXP_AV.VALUE = ETL_AV.VALUE)
			PRINT 'ATTRIBUTE VALUE RECORDS UPDATE WITH INSITE RECORDS';
			PRINT @@Rowcount;
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
				FROM [VW_PRODUCTATTRIBUTEVALUES] PAV
				INNER JOIN PRODUCT P
				ON P.NAME = CAST(PAV.PRODUCTNAME as nvarchar(20))
				INNER JOIN AttributeValue AV
				ON AV.Value = PAV.AttributeValue
				INNER JOIN AttributeType AT
				ON AT.Name = PAV.AttributeName
				AND AT.Id = AV.AttributeTypeId
				GROUP BY P.ID, AV.Id
			
		/*---------------------------------------------------------------------------------*/
		--				TABLE CATEGORY ATTRIBUTE 	
		/*---------------------------------------------------------------------------------*/

		--	-- CLEAN UP FOR TABLE [CategoryAttributeType]
		--	TRUNCATE TABLE [dbo].[CategoryAttributeType];


		--	WITH TSCat as
		--	(
		--		SELECT DISTINCT 
		--			dbo.fn_GetCategoryFullPathTradeServices(CustomerItemID) FullPath, *
		--		FROM vw_TradeServicesProduct
		--	),
		--	ETLCat as
		--	(
		--		SELECT 
		--			dbo.fn_GetCategoryFullPathETL(c.id) FullPath,*
		--		FROM Category c
		--	)

		--	-- INSERT [CATEGORYATTRIBUTETYPE] RECORDS 
		--	INSERT INTO [DBO].[CATEGORYATTRIBUTETYPE]
		--			([ID]
		--			,[CATEGORYID]
		--			,[ATTRIBUTETYPEID]
		--			,[SORTORDER]
		--			,[ISACTIVE]
		--			,[DETAILDISPLAYSEQUENCE]
		--			,[CREATEDON]
		--			,[CREATEDBY]
		--			,[MODIFIEDON]
		--			,[MODIFIEDBY])
		--	SELECT  NEWID(),
		--			C.ID				AS CATEGORYID,
		--			AT.Id				AS ATTRIBUTETYPEID, 
		--			MAX(PAV.SortOrder)	AS SORTORDER,
		--			1					AS ISACTIVE,
		--			NULL				AS [DETAILDISPLAYSEQUENCE],
		--			GETDATE()			AS CREATEDON,
		--			@UserName			AS CREATEDBY,
		--			GETDATE()			AS MODIFIEDON,
		--			@UserName			AS MODIFIEDBY
		--	FROM [VW_PRODUCTATTRIBUTEVALUES] PAV
		--	INNER JOIN PRODUCT P
		--	ON P.NAME = CAST(PAV.PRODUCTNAME as nvarchar(20))
		--	INNER JOIN AttributeType AT
		--	ON AT.Name = PAV.AttributeName
		--	INNER JOIN TSCat TSC
		--	ON P.NAME = CAST(TSC.[CUSTOMERITEMID] as nvarchar(20))
		--	INNER JOIN ETLCat C
		--	ON TSC.FullPath = C.FullPath
		--	GROUP BY AT.Id , C.ID 

		--	/*---------------------------------------------------------------------------------*/
		--	-- Look for existing records in Insite Database and update them back to ETL Tables
		--	/*---------------------------------------------------------------------------------*/
			
		--		UPDATE ETL_CAT
		--			SET ETL_CAT.ID = IXP_CAT.ID 
		--			FROM [INSITE.EXPRESSPIPE]..CategoryAttributeType IXP_CAT
		--	INNER JOIN CategoryAttributeType ETL_CAT
		--			ON (IXP_CAT.ATTRIBUTETYPEID = ETL_CAT.ATTRIBUTETYPEID
		--			AND IXP_CAT.CategoryId = ETL_CAT.CategoryId)
		--/*---------------------------------------------------------------------------------*/


				COMMIT TRANSACTION;
			END TRY
			BEGIN CATCH
				PRINT ERROR_MESSAGE()
				IF @@TRANCOUNT > 0
					ROLLBACK TRANSACTION --RollBack in case of Error
				THROW;
		END CATCH
END