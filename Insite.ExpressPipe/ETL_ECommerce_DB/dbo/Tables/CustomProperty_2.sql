CREATE TABLE [dbo].[CustomProperty] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [ParentId]   UNIQUEIDENTIFIER NULL,
    [Name]       NVARCHAR (100)   NOT NULL,
    [Value]      NVARCHAR (MAX)   NOT NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL
);

