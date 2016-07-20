CREATE PROCEDURE [dbo].[sp_AddCustomPropertiesToInSite]
--*****************************************************************************************************************
-- Name:	[sp_AddCustomPropertiesToInSite]
-- Descr:	Adds custom property to Express Pipe table
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_AddCustomPropertiesToInSite] 'OrderedBy', 'MyTestUser'
-- Test With: exec [sp_AddCustomPropertiesToInSite] 'LastShipDate', 'MyTestUser'
-- Test With: exec [sp_AddCustomPropertiesToInSite] 'CompanyName', 'MyTestUser'
-- Test With: exec [sp_AddCustomPropertiesToInSite] 'JobName', 'MyTestUser'
-- Test With: exec [sp_AddCustomPropertiesToInSite] 'InvoiceDate', 'ServiceUser'
--*****************************************************************************************************************
(
	@CustomPropertyNameToUpdate VARCHAR(150),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;WITH CTE AS (SELECT * FROM ETL_Ecommerce..CustomProperty 
				where Name = @CustomPropertyNameToUpdate)

			MERGE [Insite.ExpressPipe]..CustomProperty AS Target
			USING CTE
			 AS Source
			ON (Target.Id = Source.Id  AND Source.Name = Target.Name)
		WHEN MATCHED AND 
			(
				Target.ParentId <> Source.ParentId
				OR Target.Name <> Source.Name
				OR Target.Value <> Source.Value
			) THEN
			UPDATE SET 
				Target.ParentId = Source.ParentId,
				Target.Name = Source.Name,
				Target.Value = Source.Value,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET 
				AND Source.Name = @CustomPropertyNameToUpdate THEN
			INSERT 
				(
			      Id,
			      ParentId,
			      Name,
			      Value,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ParentId,
			   Source.Name,
			   Source.Value,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source 
			AND Target.Name = @CustomPropertyNameToUpdate THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END