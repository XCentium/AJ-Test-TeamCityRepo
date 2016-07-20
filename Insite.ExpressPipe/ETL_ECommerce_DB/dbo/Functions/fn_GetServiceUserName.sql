

CREATE FUNCTION [dbo].[fn_GetServiceUserName](@ApplicationName VARCHAR(100)) RETURNS VARCHAR
AS 
BEGIN
	DECLARE @Result VARCHAR

	SELECT @Result = UserName from [Insite.Morsco]..UserProfile WHERE ApplicationName = @ApplicationName

	RETURN @Result
END