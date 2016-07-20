CREATE TABLE [dbo].[CategoryProperty] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [CategoryId] UNIQUEIDENTIFIER NOT NULL,
    [Name]       NVARCHAR (100)   NOT NULL,
    [Value]      NVARCHAR (MAX)   NOT NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL
);

