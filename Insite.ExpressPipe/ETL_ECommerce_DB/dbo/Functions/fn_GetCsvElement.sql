
CREATE FUNCTION dbo.fn_GetCsvElement(@CSV VARCHAR(1000), @Element INT)
RETURNS VARCHAR(1000)
AS BEGIN
    DECLARE @i INT=1
	DECLARE @Result VARCHAR(1000) = ''
    
	WHILE LEN(@CSV) <> 0
    BEGIN
            IF @i=@Element
            BEGIN
              SELECT @Result = 
				CASE WHEN CHARINDEX(',',@CSV) <> 0 
					THEN LEFT(@CSV,CHARINDEX(',',@CSV)-1)
                    ELSE @CSV
                END
            END

              SELECT 
				@CSV = 
					CASE WHEN CHARINDEX(',',@CSV) <> 0 
						THEN SUBSTRING(@CSV,CHARINDEX(',',@CSV)+1,LEN(@CSV))
						ELSE ''
                    END

            SELECT @i=@i+1
    END
	RETURN @Result
END