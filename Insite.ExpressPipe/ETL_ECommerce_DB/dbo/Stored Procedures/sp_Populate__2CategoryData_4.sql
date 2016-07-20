


CREATE PROCEDURE [dbo].[sp_Populate_#2CategoryData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_ALL_Data_In_ETLDB]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_#2CategoryData] 'EXP', 'ServiceUser' 
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int


				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateETLCategory_CategoryProduct] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductCategoryAttributes] @UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 3, @JobName = 'Category', @JobDB = N'ETL', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''

				--******************************************************************************************************
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteCategory] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductCategoryAttributes]  @UserName = @User

				EXECUTE	@RC = [dbo].[sp_AddDataRefreshStatus] @JobId = 3, @JobName = 'Category', @JobDB = N'Insite', 
															  @JobStatus = N'Completed',	@ErrorMessage = N''


				--******************************************************************************************************
	END