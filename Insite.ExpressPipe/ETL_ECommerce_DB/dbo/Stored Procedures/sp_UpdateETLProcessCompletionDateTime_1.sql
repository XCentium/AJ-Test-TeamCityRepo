CREATE PROCEDURE [dbo].[sp_UpdateETLProcessCompletionDateTime]
--*****************************************************************************************************************
-- Name:	[sp_UpdateETLProcessCompletionDateTime]
-- Descr:	
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_UpdateETLProcessCompletionDateTime] 
--*****************************************************************************************************************
AS
BEGIN
	SET NOCOUNT ON;
	
	SET XACT_ABORT ON;
	DECLARE @MaxLastUpdateDate datetime;
	--Take the latest last update date from Morsco DB
	IF EXISTS (SELECT 1 FROM LastUpdate WHERE Id = 1)
	BEGIN 
		SELECT @MaxLastUpdateDate = MAX(LastUpdateDateTime) FROM DM_ECommerce..LastUpdate
		Update LU 
		SET LU.LastUpdateDateTime = @MaxLastUpdateDate,
		LU.LastChangedDateTime = GETDATE()
		FROM [LastUpdate] LU
		WHERE Id = 1	
	END 
	ELSE
	BEGIN
		INSERT [LastUpdate] (Id, LastUpdateDateTime, LastChangedDateTime)
		SELECT 1, MAX(LastUpdateDateTime), GETDATE() FROM DM_ECommerce..LastUpdate
	END
END