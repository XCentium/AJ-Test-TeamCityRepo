
CREATE PROCEDURE [dbo].[sp_PopulateETLProductDocument_Property] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLProductDocument_Property]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLProductDocument_Property] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @DocumentManagerId Uniqueidentifier
	DECLARE @ErrorMessage as Varchar(max);


	--BEGIN TRY
	--	BEGIN TRANSACTION
	SET XACT_ABORT ON;
			--*****************************************************************************************************************
			--				TABLE [Document]
			--*****************************************************************************************************************
				DELETE FROM [dbo].[Document];

				INSERT INTO [dbo].[Document]
					   ([Id]
					   ,[DocumentManagerId]
					   ,[Name]
					   ,[Description]
					   ,[CreatedOn]
					   ,[FilePath]
					   ,[FileName]
					   ,[DocumentType]
					   ,[InternalUseOnly]
					   ,[LanguageId]
					   ,[CreatedBy]
					   ,[ModifiedOn]
					   ,[ModifiedBy])
					SELECT 
						NEWID() as Id,
						DocumentManagerId, 
						ERPNumber, 
						'' as Description,
						GetDate() as CreatedOn,
						FilePath,
						'' as FileName,
						DocumentType,
						0 as  [InternalUseOnly],
						NULL as LanguageId,
						@UserName as CreatedBy,
						Getdate() as ModifiedOn,
						@UserName as ModifiedBy
					FROM
						(SELECT DISTINCT 
							dm.Id DocumentManagerId, 
							P.ERPNumber , 
							PD.URL as FilePath,
							PD.DocumentType DocumentType   
						FROM Product P (NOLOCK) 
							INNER JOIN vw_ProductDocument PD (NOLOCK)  ON P.ERPNumber = PD.ErpProductNo
							INNER JOIN DocumentManager dm (NOLOCK)  on dm.Id = p.DocumentManagerId) PPD


--************************************************************************************************************#
--				TABLE PRODUCT PROPERTY
--************************************************************************************************************#
			TRUNCATE TABLE [dbo].[ProductProperty];

			INSERT INTO [dbo].[ProductProperty]
					   ([Id]
					   ,[ProductId]
					   ,[Name]
					   ,[Value]
					   ,[CreatedOn]
					   ,[CreatedBy]
					   ,[ModifiedOn]
					   ,[ModifiedBy])
				SELECT  NEWID()
					   ,ProductId
					   ,Name
					   ,dbo.fn_ScrubData(Value) Value
					   ,GETDATE() 	
					   ,@UserName
					   ,GETDATE()
					   ,@UserName
				 FROM (
						SELECT DISTINCT
								p.Id as ProductId 
							   ,pp.[Name]
							   ,pp.[Value]
						  FROM [dbo].[vw_ProductProperty] pp
					INNER JOIN Product p (NOLOCK) 
					        ON (pp.ERPPartNo = p.ERPNumber )
						UNION
						SELECT DISTINCT
								p.Id as ProductId 
							   ,pp.[Name]
							   ,pp.[Value]
						  FROM [dbo].[vw_NonTSPProductProperty] pp
					INNER JOIN Product p (NOLOCK) 
					        ON (pp.ERPPartNo = p.ERPNumber )
					  ) PPV


			--*******************************************************************************************************************
			-- Creating Product Property for the CatalogWebSite field 
			--*******************************************************************************************************************
			--TRUNCATE THE EXISTING RECORDS FOR Order Invoice Date Product PROPERTY
			DELETE FROM [dbo].[ProductProperty]
			WHERE Name = 'CatalogWebSite';

			DECLARE @CatalogWebSite varchar(MAX) = '';
			SELECT @CatalogWebSite = @CatalogWebSite + CONVERT(varchar(MAX), WebSiteId) + ',' 
			FROM WebSiteEtlSource
			-- Remove last comma
			SELECT @CatalogWebSite = LEFT(@CatalogWebSite, LEN(@CatalogWebSite) - 1)

			INSERT INTO [dbo].[ProductProperty]
						([Id]
						,[ProductId]
						,[Name]
						,[Value]
						,[CreatedOn]
						,[CreatedBy]
						,[ModifiedOn]
						,[ModifiedBy])
			SELECT 
				NEWID() Id
				, P.Id [ProductId]
				, 'CatalogWebSite' Name
				,@CatalogWebSite Value
				, GetDate() CreatedOn
				, @UserName CreatedBy
				, GetDate() ModifiedOn
				, @UserName ModifiedBy
			FROM [CatalogProduct] CP
			JOIN Product P ON P.ERPNumber = CP.ERPNumber


			-- Tap existing [ProductProperty] Id from the InsiteExpressPipe [ProductProperty] table
			--	and update back to ETL
				--	UPDATE ETL_PP
				--	   SET ETL_PP.ID = IXP_PP.ID 
				--	  FROM [Insite.Morsco]..ProductProperty IXP_PP
				--INNER JOIN ETL_ECOMMERCE..ProductProperty ETL_PP
				--		ON (IXP_PP.ProductId = ETL_PP.ProductId
				--	   AND IXP_PP.Name = ETL_PP.Name
				--	   AND IXP_PP.Value = ETL_PP.Value)						
			
END