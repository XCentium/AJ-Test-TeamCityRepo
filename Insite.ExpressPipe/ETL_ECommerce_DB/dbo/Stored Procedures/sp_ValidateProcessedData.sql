
CREATE PROCEDURE [dbo].[sp_ValidateProcessedData]
AS
BEGIN
	DECLARE @NL NVARCHAR(2) = CHAR(13);
	DECLARE @ErrorMsg VARCHAR(MAX) = '';
	DECLARE @CurrCount int;

--Test exec sp_PostValidateProcessedData

	--Checking for product record duplicates
	--Checking for Branch Address blank check
	SELECT @CurrCount =  count(*) 
	FROM [Insite.Morsco]..Product P
	WHERE DeactivateOn is not null
	IF (@CurrCount > 0)
	BEGIN
		SET @ErrorMsg = @ErrorMsg + CAST(@CurrCount AS VARCHAR(10)) + ' Products have been deactivated.'
	END
	
	--If there is some error then throw error message
	IF (@ErrorMsg <> '')
	BEGIN
		RAISERROR(@ErrorMsg,11,1); 
	END

END