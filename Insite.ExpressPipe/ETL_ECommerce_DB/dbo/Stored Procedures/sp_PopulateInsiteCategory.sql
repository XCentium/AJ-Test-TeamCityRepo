CREATE PROCEDURE [dbo].[sp_PopulateInsiteCategory]
(
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteCategory]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [[sp_PopulateInsiteCategory]] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;
	DECLARE @WebSiteId UNIQUEIDENTIFIER = NULL;
	DECLARE @ErrorMessage VARCHAR(100);

	BEGIN TRY
		BEGIN TRANSACTION

		--************************************************************************************************************************************
		-- Category 
		--************************************************************************************************************************************

			;MERGE [Insite.Morsco]..Category AS Target
			USING
			(
				SELECT * FROM Category AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
				Target.ParentId <> Source.ParentId
				OR Target.WebSiteId <> Source.WebSiteId
				OR Target.Name <> Source.Name
				OR Target.ShortDescription <> Source.ShortDescription
				OR Target.SmallImagePath <> Source.SmallImagePath
				OR Target.LargeImagePath <> Source.LargeImagePath
				OR Target.ActivateOn <> Source.ActivateOn
				--OR Target.DeactivateOn <> Source.DeactivateOn
				OR Target.UrlSegment <> Source.UrlSegment
				OR Target.MetaKeywords <> Source.MetaKeywords
				OR Target.MetaDescription <> Source.MetaDescription
				OR Target.SortOrder <> Source.SortOrder
				OR Target.ShowDetail <> Source.ShowDetail
				OR Target.PageTitle <> Source.PageTitle
				OR Target.ContentManagerId <> Source.ContentManagerId
				OR Target.DocumentManagerId <> Source.DocumentManagerId
				OR Target.ERPProductValues <> Source.ERPProductValues
				OR Target.IsFeatured <> Source.IsFeatured
				OR Target.IsDynamic <> Source.IsDynamic
				OR Target.RuleManagerId <> Source.RuleManagerId
				OR Target.ImageAltText <> Source.ImageAltText
				OR Target.ModifiedOn <> Source.ModifiedOn
				Or Target.ModifiedBy <> Source.ModifiedBy
			 THEN
			UPDATE SET 
				Target.ParentId = Source.ParentID,
				Target.WebSiteId = Source.WebSiteId,
				Target.Name = Source.Name,
				Target.ShortDescription = Source.ShortDescription,
				Target.SmallImagePath = Source.SmallImagePath,
				Target.LargeImagePath = Source.LargeImagePath,
				Target.ActivateOn = Source.ActivateOn,
				Target.DeactivateOn = Source.DeactivateOn,
				Target.UrlSegment = Source.UrlSegment,
				Target.MetaKeywords = Source.MetaKeywords,
				Target.MetaDescription = Source.MetaDescription,
				Target.SortOrder = Source.SortOrder,
				Target.ShowDetail = Source.ShowDetail,
				Target.PageTitle = Source.PageTitle,
				Target.ContentManagerId = Source.ContentManagerId,
				Target.DocumentManagerId = Source.DocumentManagerId,
				Target.ERPProductValues = Source.ERPProductValues,
				Target.IsFeatured = Source.IsFeatured,
				Target.IsDynamic = Source.IsDynamic,
				Target.RuleManagerId = Source.RuleManagerId,
				Target.ImageAltText = Source.ImageAltText,
				Target.ModifiedBy = Source.ModifiedBy,
				Target.ModifiedOn = Source.ModifiedOn
			WHEN NOT MATCHED BY TARGET THEN
			INSERT (
				Id
			   ,ParentId
			   ,WebSiteId
			   ,Name
			   ,ShortDescription
			   ,SmallImagePath
			   ,LargeImagePath
			   ,ActivateOn
			   ,DeactivateOn
			   ,UrlSegment
			   ,MetaKeywords
			   ,MetaDescription
			   ,SortOrder
			   ,ShowDetail
			   ,PageTitle
			   ,ContentManagerId
			   ,DocumentManagerId
			   ,ERPProductValues
			   ,IsFeatured
			   ,IsDynamic
			   ,RuleManagerId
			   ,ImageAltText
			   ,CreatedOn
			   ,CreatedBy
			   ,ModifiedOn
			   ,ModifiedBy
			   )
			VALUES
			   (Source.Id,
			   Source.ParentId,
			   Source.WebSiteId,
			   Source.Name,
			   Source.ShortDescription,
			   Source.SmallImagePath,
			   Source.LargeImagePath,
			   Source.ActivateOn,
			   Source.DeactivateOn,
			   Source.UrlSegment,
			   Source.MetaKeywords,
			   Source.MetaDescription,
			   Source.SortOrder,
			   Source.ShowDetail,
			   Source.PageTitle,
			   Source.ContentManagerId,
			   Source.DocumentManagerId,
			   Source.ERPProductValues,
			   Source.IsFeatured,
			   Source.IsDynamic,
			   Source.RuleManagerId,
			   Source.ImageAltText,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy
			   )
		WHEN NOT MATCHED BY Source and Target.DeactivateOn is null THEN
			UPDATE SET Target.DeactivateOn = GETDATE(), ModifiedBy = @UserName, ModifiedOn=GetDate();

		--************************************************************************************************************************************
		-- Category Product
		--************************************************************************************************************************************

		;MERGE [Insite.Morsco]..CategoryProduct AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..CategoryProduct AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.Id <> Source.Id
				OR Target.CategoryId <> Source.CategoryId
				OR Target.ProductId <> Source.ProductId
				OR Target.SortOrder <> Source.SortOrder
			) THEN
			UPDATE SET 
				Target.Id = Source.Id,
				Target.CategoryId = Source.CategoryId,
				Target.ProductId = Source.ProductId,
				Target.SortOrder = Source.SortOrder,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      CategoryId,
			      ProductId,
			      Id,
			      SortOrder,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.CategoryId,
			   Source.ProductId,
			   Source.Id,
			   Source.SortOrder,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;
		--************************************************************************************************************************************

		--************************************************************************************************************************************
		-- Category Product
		--************************************************************************************************************************************
			DECLARE @CategoryPropertyName as Varchar(25) = 'LongDescription';
			
			WITH CTE AS (SELECT * FROM ETL_Ecommerce..CategoryProperty 
				where Name = @CategoryPropertyName)

			MERGE [Insite.Morsco]..CategoryProperty AS Target
			USING CTE
			 AS Source
			ON (Target.Id = Source.Id  AND Source.Name = Target.Name)
		WHEN MATCHED AND 
			(
				Target.CategoryId <> Source.CategoryId
				OR Target.Name <> Source.Name
				OR Target.Value <> Source.Value
			) THEN
			UPDATE SET 
				Target.CategoryId = Source.CategoryId,
				Target.Name = Source.Name,
				Target.Value = Source.Value,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET 
				AND Source.Name = @CategoryPropertyName THEN
			INSERT 
				(
			      Id,
			      CategoryId,
			      Name,
			      Value,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.CategoryId,
			   Source.Name,
			   Source.Value,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source 
			AND Target.Name = @CategoryPropertyName THEN
			DELETE;

-- END
--************************************************************************************************************************************

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;
		
END