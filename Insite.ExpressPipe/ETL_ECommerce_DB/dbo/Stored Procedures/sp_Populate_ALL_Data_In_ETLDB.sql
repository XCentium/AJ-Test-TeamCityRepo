

CREATE PROCEDURE [dbo].[sp_Populate_ALL_Data_In_ETLDB]
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB 'EXP', 'ServiceUser'
		@ETLSource as Varchar(100),
		@User  as Varchar(100),
		@SiteName as Varchar(100)
AS

	BEGIN
		BEGIN TRY

		DECLARE @RC int


				EXECUTE @RC = [dbo].[sp_PopulateETLWebSiteEtlSource] @ETLSourceId = @ETLSource , @WebSiteName = @SiteName , @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProduct_PUOM] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLCategory_CategoryProduct] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductCategoryAttributes] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductDocument_Property] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductContent_Specfication] @UserName = @User

				--EXECUTE @RC = [dbo].[sp_PopulateETLCustomer] @ETLSourceId =   @ETLSource ,@UserName = @User

				--EXECUTE @RC = [dbo].[sp_PopulateETLOrderHistory] @ETLSourceId =  @ETLSource ,@User = @User

				--EXECUTE @RC = [dbo].[sp_PopulateETLShipments] @ETLSourceId = @ETLSource ,@User = @User

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