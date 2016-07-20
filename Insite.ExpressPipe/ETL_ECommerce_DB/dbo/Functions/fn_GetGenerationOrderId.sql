
CREATE FUNCTION [dbo].[fn_GetGenerationOrderId]
--
-- Name: fn_GetShipmentId
-- Description: Common means of creating a history order number for a Generation
-- Created: 7/23/2015: Matt Glover
-- Altered:
-- Test With: SELECT dbo.fn_GetGenerationOrderId ('S1751805','1',null)
--            Expect S1751805.1.
(
	@ErpOrderNo VARCHAR(12),
	@GenID VARCHAR(5),
	@GEN VARCHAR(8)
)
RETURNS VARCHAR(30)
AS
BEGIN
	RETURN ISNULL(@ErpOrderNo,'')
		+ '.'
		+ CASE 
			-- Order gets Gen when picked.  Shows as 3 digit suffix
			WHEN @Gen IS NOT NULL THEN RIGHT('000' + @Gen, 3)
			-- Order always has GenId.  Show this as 4 digit suffix.  But remove when showing in order history UI
			-- Each orderno/gen/genid tuple needs to be unique in the generation orders
			ELSE RIGHT('0000' + ISNULL(@GenId,''), 4)
		  END
END