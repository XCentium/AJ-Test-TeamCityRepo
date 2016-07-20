

CREATE PROCEDURE [dbo].[sp_Populate_#5MiscData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_#5MiscData]
-- Descr:	Executes all the misc data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_#5MiscData] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int

				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateETLWareHouse] @ETLSourceId =   @ETLSource ,@UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 1, @JobName = 'WareHouse', @JobDB = N'ETL', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteWarehouse] @UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 1, @JobName = 'WareHouse', @JobDB = N'Insite', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
	END