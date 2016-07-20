CREATE PROCEDURE [dbo].[sp_PopulateInsiteCustomerProperty]
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteCustomerProperty]
-- Descr:	Adds customer property to Express Pipe table
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteCustomerProperty] 'PriceBranchOverride', 'ServiceUser'
-- Test With: exec [sp_PopulateInsiteCustomerProperty] 'ShipBranchOverride', 'ServiceUser'
-- Test With: exec [sp_PopulateInsiteCustomerProperty] 'IsJobAccount', 'ServiceUser'
--*****************************************************************************************************************
(
	@CustomerPropertyNameToUpdate VARCHAR(150),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;WITH CTE AS (SELECT * FROM ETL_Ecommerce..CustomerProperty 
				where Name = @CustomerPropertyNameToUpdate)

			MERGE [Insite.Morsco]..CustomerProperty AS Target
			USING CTE
			 AS Source
			ON (Target.Id = Source.Id  AND Source.Name = Target.Name)
		WHEN MATCHED AND 
			(
				Target.CustomerId <> Source.CustomerId
				OR Target.Name <> Source.Name
				OR Target.Value <> Source.Value
			) THEN
			UPDATE SET 
				Target.CustomerId = Source.CustomerId,
				Target.Name = Source.Name,
				Target.Value = Source.Value,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET 
				AND Source.Name = @CustomerPropertyNameToUpdate THEN
			INSERT 
				(
			      Id,
			      CustomerId,
			      Name,
			      Value,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.CustomerId,
			   Source.Name,
			   Source.Value,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source 
			AND Target.Name = @CustomerPropertyNameToUpdate THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END