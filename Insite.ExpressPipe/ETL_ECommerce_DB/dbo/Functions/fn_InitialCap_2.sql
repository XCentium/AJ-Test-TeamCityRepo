CREATE FUNCTION dbo.fn_InitialCap(@String VARCHAR(8000))
/***************************************************************************************************
 Purpose:
 Capitalize any lower case alpha character which follows any non alpha character or single quote.
 **************************************************************************************************/
RETURNS VARCHAR(8000)
     AS
  BEGIN 
----------------------------------------------------------------------------------------------------
DECLARE @Position INT
;
--===== Update the first character no matter what and then find the next postion that we 
     -- need to update.  The collation here is essential to making this so simple.
     -- A-z is equivalent to the slower A-Z
 SELECT @String   = STUFF(LOWER(@String),1,1,UPPER(LEFT(@String,1))) COLLATE Latin1_General_Bin,
        @Position = PATINDEX('%[^A-Za-z''][a-z]%',@String COLLATE Latin1_General_Bin)
;
--===== Do the same thing over and over until we run out of places to capitalize.
     -- Note the reason for the speed here is that ONLY places that need capitalization
     -- are even considered for @Position using the speed of PATINDEX. 
  WHILE @Position > 0
 SELECT @String   = STUFF(@String,@Position,2,UPPER(SUBSTRING(@String,@Position,2))) COLLATE Latin1_General_Bin,
        @Position = PATINDEX('%[^A-Za-z''][a-z]%',@String COLLATE Latin1_General_Bin)
;
----------------------------------------------------------------------------------------------------
 RETURN @String;
    END ;