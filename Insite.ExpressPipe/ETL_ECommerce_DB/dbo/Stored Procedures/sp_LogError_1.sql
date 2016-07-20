-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[sp_LogError] 
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	INSERT INTO [ErrorLog]  
             (
             ErrorNumber 
            ,ErrorDescription 
            ,ErrorProcedure 
            ,ErrorState 
            ,ErrorSeverity 
            ,ErrorLine 
            ,ErrorTime 
           )
           VALUES
           (
             ERROR_NUMBER()
            ,ERROR_MESSAGE()
            ,ERROR_PROCEDURE()
            ,ERROR_STATE()
            ,ERROR_SEVERITY()
            ,ERROR_LINE()
            ,GETDATE()  
           );
END