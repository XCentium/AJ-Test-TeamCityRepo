CREATE PROCEDURE [dbo].[sp_PopulateInsiteDocumentManager]
(
	
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_ALL_Data_In_ETLDB] 'EXP', 'ServiceUser', 'InsiteCommerce'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

--======================================================================================================================================
--Document Manager
--======================================================================================================================================

			;MERGE [Insite.Morsco]..DocumentManager AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..DocumentManager AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.Name <> Source.Name
			) THEN
			UPDATE SET 
				Target.Name = Source.Name,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      Name,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.Name,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

--======================================================================================================================================
--Document
--======================================================================================================================================

			;MERGE [Insite.Morsco]..Document AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Document AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.DocumentManagerId <> Source.DocumentManagerId
				OR Target.Name <> Source.Name
				OR Target.Description <> Source.Description
				OR Target.FilePath <> Source.FilePath
				OR Target.FileName <> Source.FileName
				OR Target.DocumentType <> Source.DocumentType
				OR Target.InternalUseOnly <> Source.InternalUseOnly
				OR ISNULL(Target.LanguageId,'') <> ISNULL(Source.LanguageId,'')
			) THEN
			UPDATE SET 
				Target.DocumentManagerId = Source.DocumentManagerId,
				Target.Name = Source.Name,
				Target.Description = Source.Description,
				Target.FilePath = Source.FilePath,
				Target.FileName = Source.FileName,
				Target.DocumentType = Source.DocumentType,
				Target.InternalUseOnly = Source.InternalUseOnly,
				Target.LanguageId = Source.LanguageId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      DocumentManagerId,
			      Name,
			      Description,
			      CreatedOn,
			      FilePath,
			      FileName,
			      DocumentType,
			      InternalUseOnly,
			      LanguageId,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.DocumentManagerId,
			   Source.Name,
			   Source.Description,
			   Source.CreatedOn,
			   Source.FilePath,
			   Source.FileName,
			   Source.DocumentType,
			   Source.InternalUseOnly,
			   Source.LanguageId,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;

END