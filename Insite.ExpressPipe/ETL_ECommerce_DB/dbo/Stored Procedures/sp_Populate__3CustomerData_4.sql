


CREATE PROCEDURE [dbo].[sp_Populate_#3CustomerData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_#3CustomerData]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_#3CustomerData] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int


				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateETLCustomer] @ETLSourceId =   @ETLSource ,@UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 4, @JobName = 'Customer', @JobDB = N'ETL', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteCustomer] @UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 4, @JobName = 'Customer', @JobDB = N'Insite', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************

	END