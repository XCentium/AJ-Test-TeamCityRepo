CREATE TABLE [dbo].[ProductProperty] (
    [Id]         UNIQUEIDENTIFIER CONSTRAINT [DF_ProductProperty_ProductPropertyId] DEFAULT (newsequentialid()) NOT NULL,
    [ProductId]  UNIQUEIDENTIFIER NOT NULL,
    [Name]       NVARCHAR (100)   CONSTRAINT [DF_ProductProperty_Name] DEFAULT ('') NOT NULL,
    [Value]      NVARCHAR (MAX)   CONSTRAINT [DF_ProductProperty_Value] DEFAULT ('') NOT NULL,
    [CreatedOn]  DATETIME2 (7)    CONSTRAINT [DF_ProductProperty_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]  NVARCHAR (100)   CONSTRAINT [DF_ProductProperty_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn] DATETIME2 (7)    CONSTRAINT [DF_ProductProperty_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy] NVARCHAR (100)   CONSTRAINT [DF_ProductProperty_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_ProductProperty] PRIMARY KEY CLUSTERED ([Id] ASC)
);

