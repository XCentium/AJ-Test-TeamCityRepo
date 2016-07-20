

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

				--******************************************************************************************************
		BEGIN TRY	
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteCustomer] @UserName = @User

				--******************************************************************************************************

		END TRY
		BEGIN CATCH
			--IF @@trancount > 0 ROLLBACK TRANSACTION
			--Oh!! some error occured and keeping this information here.
			EXECUTE [dbo].[sp_LogError] 
			DECLARE @msg nvarchar(2048) = error_message()  
			RAISERROR (@msg, 16, 1)
			RETURN 55555
		END CATCH
	END