CREATE TABLE [dbo].[DocumentManager] (
    [Id]         UNIQUEIDENTIFIER CONSTRAINT [DF_DocumentManager_DocumentManagerId] DEFAULT (newsequentialid()) NOT NULL,
    [Name]       NVARCHAR (100)   NOT NULL,
    [CreatedOn]  DATETIME2 (7)    CONSTRAINT [DF_DocumentManager_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]  NVARCHAR (100)   CONSTRAINT [DF_DocumentManager_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn] DATETIME2 (7)    CONSTRAINT [DF_DocumentManager_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy] NVARCHAR (100)   CONSTRAINT [DF_DocumentManager_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_DocumentManager] PRIMARY KEY CLUSTERED ([Id] ASC)
);

