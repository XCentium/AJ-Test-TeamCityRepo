

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
		
		DECLARE @RC int

				--******************************************************************************************************
				-- Populate data in to ETL DB
				--******************************************************************************************************
				EXECUTE @RC = [dbo].[sp_Populate_#1ProductData] @ETLSource = @ETLSource ,@User = @User

				EXECUTE @RC = [dbo].[sp_Populate_#2CategoryData] @ETLSource = @ETLSource ,@User = @User

				EXECUTE  @RC = [dbo].[sp_Populate_#3CustomerData]   @ETLSource = @ETLSource ,@User = @User

				EXECUTE @RC = [dbo].[sp_Populate_#4OrderHistoryData] @ETLSource = @ETLSource ,@User = @User

				EXECUTE @RC = [dbo].[sp_Populate_#5MiscData] @ETLSource = @ETLSource ,@User = @User
				--******************************************************************************************************
		END