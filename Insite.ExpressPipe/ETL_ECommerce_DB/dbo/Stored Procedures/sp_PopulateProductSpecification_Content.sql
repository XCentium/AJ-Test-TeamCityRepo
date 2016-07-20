CREATE PROCEDURE [dbo].[sp_PopulateProductSpecification_Content]
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

--=========================================================================================================
--			Merge Content Manager
--=========================================================================================================
			;MERGE [Insite.ExpressPipe]..ContentManager AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ContentManager AS Source
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

--=========================================================================================================
--			Merge Specification
--=========================================================================================================
		;MERGE [Insite.ExpressPipe]..Specification AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Specification AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.ParentId <> Source.ParentId
				OR Target.ContentManagerId <> Source.ContentManagerId
				OR Target.Name <> Source.Name
				OR Target.SortOrder <> Source.SortOrder
				OR Target.Description <> Source.Description
				OR Target.IsActive <> Source.IsActive
				OR Target.Value <> Source.Value
			) THEN
			UPDATE SET 
				Target.ParentId = Source.ParentId,
				Target.ContentManagerId = Source.ContentManagerId,
				Target.Name = Source.Name,
				Target.SortOrder = Source.SortOrder,
				Target.Description = Source.Description,
				Target.IsActive = Source.IsActive,
				Target.Value = Source.Value,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ParentId,
			      ContentManagerId,
			      Name,
			      SortOrder,
			      Description,
			      IsActive,
			      Value,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ParentId,
			   Source.ContentManagerId,
			   Source.Name,
			   Source.SortOrder,
			   Source.Description,
			   Source.IsActive,
			   Source.Value,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

--=========================================================================================================
--			Merge Product Product Specification
--=========================================================================================================

			;MERGE [Insite.ExpressPipe]..ProductSpecification AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ProductSpecification AS Source
			) AS Source
			ON (Target.ProductId = Source.ProductId AND
				Target.SpecificationId = Source.SpecificationId)
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      ProductId,
			      SpecificationId				)
			VALUES
			(
			   Source.ProductId,
			   Source.SpecificationId			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

--=========================================================================================================
--			Merge Product Content
--=========================================================================================================

			;MERGE [Insite.ExpressPipe]..Content AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Content AS Source
			) AS Source
			ON Target.Id = Source.Id
			WHEN MATCHED AND 
			(
				Target.ContentManagerId <> Source.ContentManagerId
				OR Target.Name <> Source.Name
				OR Target.Type <> Source.Type
				OR Target.Html <> Source.Html
				OR Target.SubmittedForApprovalOn <> Source.SubmittedForApprovalOn
				OR Target.ApprovedOn <> Source.ApprovedOn
				OR Target.PublishToProductionOn <> Source.PublishToProductionOn
				OR Target.CreatedById <> Source.CreatedById
				OR Target.ApprovedById <> Source.ApprovedById
				OR Target.Revision <> Source.Revision
				OR Target.DeviceType <> Source.DeviceType
				OR Target.PersonaId <> Source.PersonaId
				OR Target.LanguageId <> Source.LanguageId
			) THEN
			UPDATE SET 
				Target.ContentManagerId = Source.ContentManagerId,
				Target.Name = Source.Name,
				Target.Type = Source.Type,
				Target.Html = Source.Html,
				Target.SubmittedForApprovalOn = Source.SubmittedForApprovalOn,
				Target.ApprovedOn = Source.ApprovedOn,
				Target.PublishToProductionOn = Source.PublishToProductionOn,
				Target.CreatedById = Source.CreatedById,
				Target.ApprovedById = Source.ApprovedById,
				Target.Revision = Source.Revision,
				Target.DeviceType = Source.DeviceType,
				Target.PersonaId = Source.PersonaId,
				Target.LanguageId = Source.LanguageId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ContentManagerId,
			      Name,
			      Type,
			      Html,
			      SubmittedForApprovalOn,
			      ApprovedOn,
			      PublishToProductionOn,
			      CreatedOn,
			      CreatedById,
			      ApprovedById,
			      Revision,
			      DeviceType,
			      PersonaId,
			      LanguageId,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ContentManagerId,
			   Source.Name,
			   Source.Type,
			   Source.Html,
			   Source.SubmittedForApprovalOn,
			   Source.ApprovedOn,
			   Source.PublishToProductionOn,
			   Source.CreatedOn,
			   Source.CreatedById,
			   Source.ApprovedById,
			   Source.Revision,
			   Source.DeviceType,
			   Source.PersonaId,
			   Source.LanguageId,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;
--=========================================================================================================

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;

END