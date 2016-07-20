

CREATE FUNCTION [dbo].[fn_ScrubData2](@String VARCHAR(4096))
RETURNS VARCHAR(4096)
BEGIN
	--IF @String like  '"%"' 
	--BEGIN
	--	SET @String = SUBSTRING(@String, 2, LEN(@String) - 2)
	--END

 	RETURN Replace(Replace(@String, '""""', '"'),'""','"')

END