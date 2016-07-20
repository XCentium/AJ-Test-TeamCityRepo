
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

 SELECT @Result = Replace([TsSchemaParentClassName] + CASE WHEN ISNULL([TsSchemaLeafClassName],'') = '' THEN '' ELSE '|' + TsSchemaLeafClassName END, ' ','')
 FROM vw_TradeServicesProduct
 WHERE CustomerItemID = @CustomerItemId

 RETURN @Result
END