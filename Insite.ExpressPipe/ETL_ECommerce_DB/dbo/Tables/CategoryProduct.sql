CREATE TABLE [dbo].[CategoryProduct] (
    [CategoryId] UNIQUEIDENTIFIER NOT NULL,
    [ProductId]  UNIQUEIDENTIFIER NOT NULL,
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [SortOrder]  INT              NOT NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL,
    CONSTRAINT [PK_CategoryProduct] PRIMARY KEY CLUSTERED ([Id] ASC)
);

