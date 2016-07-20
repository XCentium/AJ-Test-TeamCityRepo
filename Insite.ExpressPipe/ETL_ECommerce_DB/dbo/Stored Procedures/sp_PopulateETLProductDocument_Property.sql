
CREATE PROCEDURE [dbo].[sp_PopulateETLProductDocument_Property] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @DocumentManagerId Uniqueidentifier
	DECLARE @ErrorMessage as Varchar(max);


	BEGIN TRY
		BEGIN TRANSACTION
--#################################################################################################################
--					TABLE [DocumentManager]
--#################################################################################################################
				--TRUNCATE TABLE [dbo].[DocumentManager];
				DELETE FROM [dbo].[DocumentManager];

				--DECLARE @UserName Varchar(50)
				--SET @UserName = 'MySErviceUsre';

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
					FROM PRODUCT

--#############################################################################################################
--				UPDATE PRODUCT.DOCUMENTMANAGERID WITH THE DOCUMENT MANAGER DETAILS
--#############################################################################################################
					Update P 
						SET P.DocumentManagerId = DM.Id
					FROM Product P
						INNER JOIN DocumentManager DM
							ON (P.Name = DM.Name)

--#################################################################################################################
--				TABLE [Document]
--#################################################################################################################
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
						Name, 
						'' as Description,
						GetDate() as CreatedOn,
						FilePath,
						'' as FileName,
						'' as DocumentType,
						0 as  [InternalUseOnly],
						NULL as LanguageId,
						'' as CreatedBy,
						Getdate() as ModifiedOn,
						'' as ModifiedBy
					FROM
						(SELECT DISTINCT 
							P.DocumentManagerId, 
							PD.Name, 
							PD.URL as FilePath  
						FROM Product P
							INNER JOIN vw_ProductDocument PD
							ON (CAST(P.Name as Float) = PD.ErpProductNo)) PPD


--#############################################################################################################
--				TABLE PRODUCT PROPERTY
--#############################################################################################################
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
					   ,Value
					   ,GETDATE() 	
					   ,''
					   ,GETDATE()
					   ,''
				 FROM (
						SELECT DISTINCT
								p.Id as ProductId 
							   ,pp.[Name]
							   ,pp.[Value]
						  FROM [dbo].[vw_ProductProperty] pp
					INNER JOIN Product p
					        ON (pp.ERPPartNo = CAST (p.ERPNumber as Float)  )
					  ) PPV

			-- Tap existing [ProductProperty] Id from the InsiteExpressPipe [ProductProperty] table
			--	and update back to ETL
				--	UPDATE ETL_PP
				--	   SET ETL_PP.ID = IXP_PP.ID 
				--	  FROM [INSITE.EXPRESSPIPE]..ProductProperty IXP_PP
				--INNER JOIN ETL_ECOMMERCE..ProductProperty ETL_PP
				--		ON (IXP_PP.ProductId = ETL_PP.ProductId
				--	   AND IXP_PP.Name = ETL_PP.Name
				--	   AND IXP_PP.Value = ETL_PP.Value)						
				COMMIT TRAnsaction;
			END TRY
			BEGIN CATCH
				PRINT ERROR_MESSAGE()
				IF @@TRANCOUNT > 0
					ROLLBACK TRANSACTION --RollBack in case of Error
				THROW;
			END CATCH
END