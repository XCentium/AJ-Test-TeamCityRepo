CREATE TABLE [dbo].[DataRefreshLog] (
    [Id]           UNIQUEIDENTIFIER NOT NULL,
    [JobId]        INT              NULL,
    [JobDate]      DATETIME         NOT NULL,
    [JobName]      VARCHAR (100)    NOT NULL,
    [JobDB]        VARCHAR (100)    NULL,
    [JobStatus]    VARCHAR (250)    NOT NULL,
    [ErrorMessage] VARCHAR (MAX)    NULL
);

