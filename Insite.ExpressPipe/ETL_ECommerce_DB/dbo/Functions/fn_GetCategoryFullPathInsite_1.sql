
CREATE FUNCTION [dbo].[fn_GetCategoryFullPathInsite]
(
 @Id UNIQUEIDENTIFIER
)
RETURNS VARCHAR(1000) AS
-- =============================================
-- Author:  Venkatesan PS
-- Create date: 15th July 2015
-- Description: Get a pipe-delimited string showing the full category path of multilevel categories
-- =============================================
BEGIN
 DECLARE @Result VARCHAR(1000) = ''
 DECLARE @Current UNIQUEIDENTIFIER = @Id

 WHILE @Current IS NOT NULL
 BEGIN
  SELECT 
   @Current = ParentID, 
   @Result = c.Name
    + CASE WHEN @Result = '' THEN '' ELSE '|' END
    + @Result 
  FROM [Insite.Morsco].dbo.Category C
  WHERE ID = @Current
 END
 RETURN dbo.fn_ScrubData(@Result)
END