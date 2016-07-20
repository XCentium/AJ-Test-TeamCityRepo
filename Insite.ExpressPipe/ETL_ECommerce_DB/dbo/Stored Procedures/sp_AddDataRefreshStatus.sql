
-- =============================================
-- Author:		<Venkatesan PS>
-- Create date: <01/21/2016>
-- Description:	<Add entry to data refresh log table>
-- =============================================
CREATE PROCEDURE [dbo].[sp_AddDataRefreshStatus] 
			@JobId int
		   ,@JobName varchar(100)
           ,@JobDB varchar(100)
           ,@JobStatus varchar(50)
           ,@ErrorMessage VARCHAR(MAX)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	INSERT INTO [dbo].[DataRefreshLog]
           ([Id]
           ,[JobId]
           ,[JobDate]
           ,[JobName]
           ,[JobDB]
           ,[JobStatus]
           ,[ErrorMessage])
     VALUES
           (NEWID()
           ,@JobId
           ,GETDATE()
           ,@JobName
           ,@JobDB
           ,@JobStatus
           ,@ErrorMessage)
END