CREATE TABLE [dbo].[ProductListType] (
    [Id]         UNIQUEIDENTIFIER DEFAULT (newsequentialid()) NOT NULL,
    [ListType]   VARCHAR (50)     NULL,
    [Name]       VARCHAR (100)    NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL,
    CONSTRAINT [PK_ProductList] PRIMARY KEY CLUSTERED ([Id] ASC)
);

