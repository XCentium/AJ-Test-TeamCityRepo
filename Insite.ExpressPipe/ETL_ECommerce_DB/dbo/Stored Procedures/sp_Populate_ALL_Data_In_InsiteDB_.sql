
CREATE PROCEDURE [dbo].[sp_Populate_ALL_Data_In_InsiteDB_]
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInInsite_DB
-- Descr:	Executes all the Product data related stored procedures in Insite Express Pipe Database for the data population
--			Data flow from ETL Ecommerce DB --> Insite ExpressPipe DB
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec sp_Execute_ALL_SPs_ToPopulateProductDataInInsite_DB 'EXP', 'ServiceUser'
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		BEGIN TRY

		DECLARE @RC int

				EXECUTE @RC = [dbo].[sp_PopulateInsiteDocumentManager]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProduct] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteCategory] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteCategoryProduct] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductUnitOfMeasure] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteAttributeType] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteAttributeValue] @ETLSourceId = @ETLSource ,@UserName = @User
	
				EXECUTE @RC = [dbo].[sp_PopulateInsiteCategoryAttributeType] @ETLSourceId = @ETLSource ,@UserName = @User
	
				EXECUTE @RC = [dbo].[sp_PopulateInsiteContentManager]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteSpecification]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductSpecification]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteContent]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteDocument]  @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductProperty] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductAttributeValue] @ETLSourceId = @ETLSource ,@UserName = @User

				--EXECUTE @RC = [dbo].[sp_PopulateInsiteCustomer] @ETLSourceId = @ETLSource ,@UserName = @User

				--EXECUTE @RC = [dbo].[sp_PopulateInsiteOrderHistory] @ETLSourceId = @ETLSource ,@UserName = @User

				--EXECUTE @RC = [dbo].[sp_PopulateInsiteShipment] @ETLSourceId = @ETLSource ,@UserName = @User


		END TRY
		BEGIN CATCH
			--Oh!! some error occured and keeping this information here.
			EXECUTE [dbo].[sp_LogError] 
			DECLARE @msg nvarchar(2048) = error_message()  
			RAISERROR (@msg, 16, 1)
			RETURN 55555
		END CATCH
	END