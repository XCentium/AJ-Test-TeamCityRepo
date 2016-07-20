
CREATE FUNCTION dbo.fn_CsvContains(@CSV VARCHAR(1000), @Target VARCHAR(1000))
RETURNS BIT
AS BEGIN
	DECLARE @Result BIT = 0
	SET @Result = CASE
		WHEN @CSV LIKE '%,' + @Target + ',%' THEN 1
		WHEN @CSV LIKE  @Target + ',%' THEN 1
		WHEN @CSV LIKE '%,' + @Target THEN 1
		WHEN @CSV = @Target THEN 1
		ELSE 0
	END
	RETURN @Result
END