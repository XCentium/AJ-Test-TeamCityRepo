CREATE FUNCTION dbo.fn_Remove_Duplicate_Characters(@string varchar(max))
RETURNs VARCHAR(MAX)
BEGIN
	DECLARE @result VARCHAR(MAX) = '';

	select @result=@result+min(substring(@string ,number,1)) from
	(
		select number from master..spt_values	
		where type='p' and number between 1 and len(@string )
	) as t 
	group by substring(@string,number,1)
	order by min(number)
 
	return @result
END