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

	DECLARE @ErrorMessage VARCHAR(100);

	SET XACT_ABORT ON;

	TRUNCATE TABLE [LastUpdate];

	INSERT INTO [LastUpdate]
			   ([LastUpdateDateTime]
			   ,[Rowid])
		 VALUES
			   (GETDATE()
			   ,1);

END