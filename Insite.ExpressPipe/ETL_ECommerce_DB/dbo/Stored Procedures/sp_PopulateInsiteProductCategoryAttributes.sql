CREATE PROCEDURE [dbo].[sp_PopulateInsiteProductCategoryAttributes]
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteProductCategoryAttributes]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteProductCategoryAttributes] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
(
	
	@UserName VARCHAR(50)
)
AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This Procedure is created to populate the 
--               AttributeType Table to link AttributeType Data
--				 Morsco.com ETL DB --> Insite ExpressPipe DB
-- =============================================
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

--==============================================================================================================
--			Merge Insite Attribute Type
--==============================================================================================================
			;MERGE [Insite.Morsco]..AttributeType AS Target
			USING
			(
				SELECT * FROM AttributeType AS Source
			) AS Source
			ON Target.Id = Source.Id OR Target.Name = Source.Name
		WHEN MATCHED AND 
			(
				Target.Id <> Source.Id
				OR Target.Name <> Source.Name
				OR Target.IsActive <> Source.IsActive
				OR Target.Label <> Source.Label
				OR Target.IsFilter <> Source.IsFilter
				OR Target.IsComparable <> Source.IsComparable
			) THEN
			UPDATE SET 
				Target.Id = Source.Id,
				Target.Name = Source.Name,
				Target.IsActive = Source.IsActive,
				Target.Label = Source.Label,
				Target.IsFilter = Source.IsFilter,
				Target.IsComparable = Source.IsComparable,
				Target.CreatedOn = Source.CreatedOn,
				Target.CreatedBy = Source.CreatedBy,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      Name,
			      IsActive,
			      Label,
			      IsFilter,
			      IsComparable,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.Name,
			   Source.IsActive,
			   Source.Label,
			   Source.IsFilter,
			   Source.IsComparable,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET Target.IsActive = 0, Target.ModifiedBy=@UserName, Target.ModifiedOn = GetDate();

--==============================================================================================================
--			Merge Insite Attribute Value
--==============================================================================================================
		;MERGE [Insite.Morsco]..AttributeValue AS Target
			USING
			(
				SELECT * FROM AttributeValue AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.AttributeTypeId <> Source.AttributeTypeId
				OR Target.Value <> Source.Value
				OR Target.SortOrder <> Source.SortOrder
				OR Target.IsActive <> Source.IsActive
				OR Target.ImagePath <> Source.ImagePath
			) THEN
			UPDATE SET 
				Target.AttributeTypeId = Source.AttributeTypeId,
				Target.Value = Source.Value,
				Target.SortOrder = Source.SortOrder,
				Target.IsActive = Source.IsActive,
				Target.ImagePath = Source.ImagePath,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      AttributeTypeId,
			      Value,
			      SortOrder,
			      IsActive,
			      ImagePath,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.AttributeTypeId,
			   Source.Value,
			   Source.SortOrder,
			   Source.IsActive,
			   Source.ImagePath,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET Target.IsActive = 0, Target.ModifiedBy=@UserName, Target.ModifiedOn = GetDate();

--==============================================================================================================
--			Merge Insite Product Attribute Value
--==============================================================================================================
			;MERGE [Insite.Morsco]..ProductAttributeValue AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ProductAttributeValue AS Source
			) AS Source
			ON Target.ProductId = Source.ProductId 
				AND Target.AttributeValueId = Source.AttributeValueId
			
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      ProductId,
			      AttributeValueId				)
			VALUES
			(
			   Source.ProductId,
			   Source.AttributeValueId			)
			WHEN NOT MATCHED BY Source THEN
				DELETE;

--==============================================================================================================
--			Merge Insite Category Attribute Value
--==============================================================================================================
		;MERGE [Insite.Morsco]..CategoryAttributeType AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..CategoryAttributeType AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.CategoryId <> Source.CategoryId
				OR Target.AttributeTypeId <> Source.AttributeTypeId
				OR Target.SortOrder <> Source.SortOrder
				OR Target.IsActive <> Source.IsActive
				OR ISNULL(Target.DetailDisplaySequence,0) <> ISNULL(Source.DetailDisplaySequence,0)
			) THEN
			UPDATE SET 
				Target.CategoryId = Source.CategoryId,
				Target.AttributeTypeId = Source.AttributeTypeId,
				Target.SortOrder = Source.SortOrder,
				Target.IsActive = Source.IsActive,
				Target.DetailDisplaySequence = Source.DetailDisplaySequence,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      CategoryId,
			      AttributeTypeId,
			      SortOrder,
			      IsActive,
			      DetailDisplaySequence,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.CategoryId,
			   Source.AttributeTypeId,
			   Source.SortOrder,
			   Source.IsActive,
			   Source.DetailDisplaySequence,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET Target.IsActive = 0, Target.ModifiedBy=@UserName, Target.ModifiedOn = GetDate();

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;

END