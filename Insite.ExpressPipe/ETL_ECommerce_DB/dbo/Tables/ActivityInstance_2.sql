CREATE TABLE [dbo].[ActivityInstance] (
    [ActivityInstanceId] UNIQUEIDENTIFIER DEFAULT (newsequentialid()) NOT NULL,
    [ActivityName]       VARCHAR (100)    NULL,
    [StartDatetime]      DATETIME         NULL
);

