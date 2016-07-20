
CREATE FUNCTION [dbo].[fn_GetCategoryFullPathTradeServices]
(
 @CustomerItemId BIGINT
)
RETURNS VARCHAR(1000) AS
-- =============================================
-- Author:  Venkatesan PS
-- Create date: 15th July 2015
-- Description: Get a pipe-delimited string showing the full category path of multilevel categories
-- =============================================
BEGIN
 DECLARE @Result VARCHAR(1000) = ''

 --SELECT @Result = 
	--Replace([TsSchemaLevel1] + 
	--CASE WHEN ISNULL([TsSchemaLevel2],'') = '' THEN '' ELSE '|' + [TsSchemaLevel2] END + 
	--CASE WHEN ISNULL([TsSchemaLevel3],'') = '' THEN '' ELSE '|' + [TsSchemaLevel3] END +
	--CASE WHEN ISNULL([TsSchemaLevel4],'') = '' THEN '' ELSE '|' + [TsSchemaLevel4] END +
	--CASE WHEN ISNULL([TsSchemaLevel5],'') = '' THEN '' ELSE '|' + [TsSchemaLevel5] END, 
	--' ','')
SELECT @Result = dbo.fn_ScrubData(FullPath)
 FROM TradeServicesProduct
 WHERE CustomerItemID = @CustomerItemId

 RETURN @Result 
END