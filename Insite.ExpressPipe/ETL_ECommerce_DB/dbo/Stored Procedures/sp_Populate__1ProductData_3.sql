

CREATE PROCEDURE [dbo].[sp_Populate_#1ProductData]
--*****************************************************************************************************************
-- Name:	[[sp_Populate_#1ProductData]]
-- Descr:	Executes all the Product data related stored procedures in ETL Database and further merges data with expresspipe database
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
---- Test With: exec [sp_Populate_#1ProductData] 'EXP'
--*****************************************************************************************************************
		@ETLSource as Varchar(100),
		@User  as Varchar(100)
AS

	BEGIN
		
		DECLARE @RC int

				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateETLProduct_PUOM] @ETLSourceId = @ETLSource ,@UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductDocument_Property] @UserName = @User

				EXECUTE  [dbo].[sp_PopulateETLProductContent_Specfication]   @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateETLProductList] @UserName = @User

				--******************************************************************************************************
				--******************************************************************************************************
				-- Merge data with ExpressPipe DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_PopulateInsiteDocumentManager]  @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProduct] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductSpecification_Content] @UserName = @User

				EXECUTE @RC = [dbo].[sp_PopulateInsiteProductList] @UserName = @User
				--******************************************************************************************************
	END