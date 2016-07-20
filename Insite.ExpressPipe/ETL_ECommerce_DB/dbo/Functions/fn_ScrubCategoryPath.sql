
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[fn_ScrubCategoryPath] 
(
	-- Add the parameters for the function here
	@Input Varchar(500)
)
RETURNS Varchar (500)
AS
BEGIN
	DECLARE @vInput varchar(max);
	-- Return the result of the function
	set @vInput = @Input;
	set @vInput = REPLACE(@vInput,' ', '')
	set @vInput = REPLACE(@vInput,'"', '')
	set @vInput = REPLACE(@vInput,'(', '')
	set @vInput = REPLACE(@vInput,')', '')
	set @vInput = REPLACE(@vInput,'/', '')
	set @vInput = REPLACE(@vInput,'\', '')
	return @vInput;
END