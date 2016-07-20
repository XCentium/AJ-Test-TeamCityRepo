CREATE TABLE [dbo].[ErrorLog] (
    [ErrorID]          BIGINT          IDENTITY (1, 1) NOT NULL,
    [ErrorNumber]      NVARCHAR (50)   NOT NULL,
    [ErrorDescription] NVARCHAR (4000) NULL,
    [ErrorProcedure]   NVARCHAR (100)  NULL,
    [ErrorState]       INT             NULL,
    [ErrorSeverity]    INT             NULL,
    [ErrorLine]        INT             NULL,
    [ErrorTime]        DATETIME        NULL,
    PRIMARY KEY CLUSTERED ([ErrorID] ASC)
);

