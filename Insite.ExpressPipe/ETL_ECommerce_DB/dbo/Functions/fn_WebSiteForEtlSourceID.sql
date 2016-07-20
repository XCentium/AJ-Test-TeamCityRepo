CREATE Function [dbo].[fn_WebSiteForEtlSourceID](@ETLSourceID VARCHAR(5)) RETURNS UNIQUEIDENTIFIER
AS 
BEGIN
	DECLARE @Result UNIQUEIDENTIFIER

	SELECT @Result = WebsiteID from WebSiteEtlSource WHERE ETLSourceID = @ETLSourceID

	RETURN @Result
END