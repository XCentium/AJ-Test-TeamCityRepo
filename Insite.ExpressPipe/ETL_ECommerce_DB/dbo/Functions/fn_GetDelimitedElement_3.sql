

CREATE FUNCTION [dbo].[fn_GetDelimitedElement](@CSV VARCHAR(1000), @Element INT, @delimiter varchar(10))
RETURNS VARCHAR(1000)
AS BEGIN
    DECLARE @i INT=1
	DECLARE @Result VARCHAR(1000) = ''
    
	WHILE LEN(@CSV) <> 0
    BEGIN
            IF @i=@Element
            BEGIN
              SELECT @Result = 
				CASE WHEN CHARINDEX(@delimiter,@CSV) <> 0 
					THEN LEFT(@CSV,CHARINDEX(@delimiter,@CSV)-1)
                    ELSE @CSV
                END
            END

              SELECT 
				@CSV = 
					CASE WHEN CHARINDEX(@delimiter,@CSV) <> 0 
						THEN SUBSTRING(@CSV,CHARINDEX(@delimiter,@CSV)+1,LEN(@CSV))
						ELSE ''
                    END

            SELECT @i=@i+1
    END
	RETURN @Result
END