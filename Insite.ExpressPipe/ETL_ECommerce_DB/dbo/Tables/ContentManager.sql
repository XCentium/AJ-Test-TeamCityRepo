CREATE TABLE [dbo].[ContentManager] (
    [Id]         UNIQUEIDENTIFIER CONSTRAINT [DF_ContentManager_ContentManagerId] DEFAULT (newsequentialid()) NOT NULL,
    [Name]       NVARCHAR (100)   CONSTRAINT [DF_ContentManager_Name] DEFAULT ('') NOT NULL,
    [CreatedOn]  DATETIME2 (7)    CONSTRAINT [DF_ContentManager_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]  NVARCHAR (100)   CONSTRAINT [DF_ContentManager_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn] DATETIME2 (7)    CONSTRAINT [DF_ContentManager_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy] NVARCHAR (100)   CONSTRAINT [DF_ContentManager_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_ContentManager] PRIMARY KEY CLUSTERED ([Id] ASC)
);

