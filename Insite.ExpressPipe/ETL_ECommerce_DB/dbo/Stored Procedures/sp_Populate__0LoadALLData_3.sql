


CREATE PROCEDURE [dbo].[sp_Populate_#0LoadALLData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_#0LoadALLData]
-- Descr:	Executes all the Product data related stored procedures in ETL Database and further merges data with expresspipe database
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
---- Test With: exec [sp_Populate_#0LoadALLData] 'EXP', 'ServiceUser' 
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int;
		DECLARE	@return_value int;
		DECLARE @DataAvailable varchar(5);


				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************

				EXEC	@RC = [dbo].sp_ValidateLastUpdateDateForRefresh

				IF(@RC = 0) -- if the latest data is available for processing..
				BEGIN
					EXECUTE @RC = [dbo].[sp_ValidateSourceData] @EtlSource
					IF(@RC = 0) -- If it passes all the validation before processing data..
					BEGIN
						EXECUTE @RC = [dbo].[sp_Populate_#5MiscData] @ETLSource = @ETLSource ,@User = @User
						EXECUTE @RC = [dbo].[sp_Populate_#1ProductData] @ETLSource = @ETLSource ,@User = @User
						EXECUTE @RC = [dbo].[sp_Populate_#2CategoryData] @ETLSource = @ETLSource ,@User = @User
						EXECUTE	@RC = [dbo].[sp_RebuildProductIndex]
						EXECUTE @RC = [dbo].[sp_Populate_#3CustomerData]   @ETLSource = @ETLSource ,@User = @User
						EXECUTE @RC = [dbo].[sp_Populate_#4OrderHistoryData] @ETLSource = @ETLSource ,@User = @User
						-- Update ETL Process completion timestamp..
						EXECUTE @RC = [dbo].[sp_UpdateETLProcessCompletionDateTime] 

						--Finally check the data after processing completes..
						EXECUTE @RC = [dbo].[sp_ValidateProcessedData] 
						IF(@RC <> 0) -- If it passes all the validation before processing data..
						BEGIN
								RAISERROR ('There are some issues in the processed data.. Please check..',11,1)
						END
					END
				END
				




				--******************************************************************************************************
	END