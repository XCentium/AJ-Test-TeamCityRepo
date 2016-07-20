


CREATE PROCEDURE [dbo].[sp_Populate_#4OrderHistoryData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_#4OrderHistoryData]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_#4OrderHistoryData] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int

				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateETLOrderHistory] @ETLSourceId =   @ETLSource ,@User = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLInvoiceHistory] @ETLSourceId =   @ETLSource ,@User = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 5, @JobName = 'OrderHistory', @JobDB = N'ETL', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteOrderHistory] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteInvoiceHistory] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteCustomProperty] @UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 5, @JobName = 'OrderHistory', @JobDB = N'Insite', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
	END