

CREATE PROCEDURE [dbo].[sp_Populate_#2CategoryData]
--*****************************************************************************************************************
-- Name:	[sp_Populate_ALL_Data_In_ETLDB]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_#2CategoryData] 'EXP', 'TestServiceUser' 
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

				--******************************************************************************************************
		BEGIN TRY
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteCategory] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductCategoryAttributes]  @UserName = @User

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