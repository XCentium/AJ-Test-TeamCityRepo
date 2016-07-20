CREATE Function [dbo].[fn_CheckLatestDataAvailability]() 
RETURNS VARCHAR(5)
AS 
BEGIN

	/****** Script for SelectTopNRows command from SSMS  ******/
	RETURN	(SELECT CASE WHEN CONVERT(VARCHAR(10), ISNULL(DL.LastUpdateDateTime,'1/1/1900'), 111) > CONVERT(VARCHAR(10), ISNULL(EL.LastUpdateDateTime,'1/1/1900'), 111) 
		THEN 'Yes'
		ELSE 1/0 -- Generate Error 
		END 	
	  FROM [LastUpdate] EL
	  join DM_ECommerce..LastUpdate DL ON DL.Rowid = EL.Rowid);
END