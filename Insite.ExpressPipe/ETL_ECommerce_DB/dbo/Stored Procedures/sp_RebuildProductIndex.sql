
-- =============================================
-- Author:		<Venkatesan PS>
-- Create date: <01/21/2016>
-- Description:	<Rebuilds product index>
-- =============================================
CREATE PROCEDURE [dbo].[sp_RebuildProductIndex] 
AS
BEGIN
	SET NOCOUNT ON;
	EXEC msdb.dbo.sp_start_job N'Product Search Index Rebuild' ;
END