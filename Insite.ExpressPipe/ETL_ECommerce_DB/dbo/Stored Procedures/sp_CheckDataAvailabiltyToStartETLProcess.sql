CREATE PROCEDURE [dbo].[sp_CheckDataAvailabiltyToStartETLProcess] 
@DataAvailable VARCHAR(5) OUTPUT
AS 
BEGIN
	SET NOCOUNT ON;

	SET XACT_ABORT ON;

	DECLARE @Result VARCHAR(5)

	/****** Script for SelectTopNRows command from SSMS  ******/
	SELECT @DataAvailable = CASE 
		WHEN CONVERT(VARCHAR(10), DL.LastUpdateDateTime, 111) > CONVERT(VARCHAR(10), EL.LastUpdateDateTime, 111) 
		THEN 'Yes' ELSE 'No' END 	
	  FROM [LastUpdate] EL
	  join DM_ECommerce..LastUpdate DL ON DL.Rowid = EL.Rowid

	  Print @DataAvailable;
	  if (@DataAvailable = 'No') 
	  BEGIN
		RAISERROR(50111,10,1,'No data availabale to update');
	  END
END

--SELECT [dbo].[fn_IsLatestDataAvl] ()
--GO