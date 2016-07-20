
CREATE PROCEDURE [dbo].[sp_PopulateETLWebSiteEtlSource] 
	-- Add the parameters for the stored procedure here
	@ETLSourceId as Varchar(50),
	@WebSiteName as Varchar(50),
	@UserName as Varchar(100)
AS
--*****************************************************************************************************************
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_ALL_Data_In_ETLDB] 'EXP', 'ServiceUser', 'InsiteCommerce'
--*****************************************************************************************************************
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			TRUNCATE TABLE WebSiteEtlSource;
			INSERT WebSiteEtlSource (
				WebSiteId, 
				ETLSourceID
				) 
			SELECT 
				[Id], 
				@ETLSourceId
			FROM [Insite.Morsco].[dbo].[WebSite] WHERE Name = @WebSiteName;

		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END CATCH
END