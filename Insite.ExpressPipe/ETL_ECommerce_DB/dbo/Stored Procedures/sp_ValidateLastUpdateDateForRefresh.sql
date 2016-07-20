CREATE PROCEDURE [dbo].[sp_ValidateLastUpdateDateForRefresh] 
AS 
-- Test exec [dbo].[sp_ValidateLastUpdateDateForRefresh] 
BEGIN
	SET NOCOUNT ON;

	SET XACT_ABORT ON;

	DECLARE @ErrorMsg VARCHAR(MAX) = ''
	DECLARE @NewUpdateDate DateTime;
	DECLARE @LastUpdateDate DateTime;

	SELECT @NewUpdateDate = MAX(LastUpdateDateTime) 
	FROM DM_ECommerce..[LastUpdate] 

	SELECT @LastUpdateDate = MAX(LastUpdateDateTime)
	FROM [LastUpdate] 

	SET @ErrorMsg = 'No new updates from Morsco database to be processed. New update date is (' + CAST(@NewUpdateDate as VARCHAR(25)) + '), Last updated date is (' +  CAST(@LastUpdateDate as VARCHAR(25)) + ').';
	IF (@NewUpdateDate < @LastUpdateDate) 
	BEGIN
	RAISERROR(@ErrorMsg,11,1);
  END
END

--SELECT [dbo].[fn_IsLatestDataAvl] ()
--GO