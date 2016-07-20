

CREATE PROCEDURE [dbo].[sp_PopulateInsiteCustomProperty]
(
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteCustomProperty]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteCustomProperty] 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'OrderedBy', @UserName;
		COMMIT TRANSACTION
		Print '1'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'LastShipDate', @UserName;
		COMMIT TRANSACTION
		Print '2'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'CompanyName', @UserName;
		COMMIT TRANSACTION
		Print '3'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'JobName', @UserName;
		COMMIT TRANSACTION
		Print '4'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'InvoiceDate', @UserName;
		COMMIT TRANSACTION
		Print '5'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'DiscountDate', @UserName;
		COMMIT TRANSACTION
		Print '6'
			
		BEGIN TRANSACTION			
			Exec [dbo].[sp_AddCustomPropertiesToInSite] 'GenerationCount', @UserName;
		COMMIT TRANSACTION
		Print '8'

	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END