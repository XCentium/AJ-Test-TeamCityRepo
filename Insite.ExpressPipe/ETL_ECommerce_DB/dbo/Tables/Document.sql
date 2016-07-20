CREATE TABLE [dbo].[Document] (
    [Id]                UNIQUEIDENTIFIER CONSTRAINT [DF_Document_DocumentId] DEFAULT (newsequentialid()) NOT NULL,
    [DocumentManagerId] UNIQUEIDENTIFIER NOT NULL,
    [Name]              NVARCHAR (100)   CONSTRAINT [DF_Document_Name] DEFAULT ('') NOT NULL,
    [Description]       NVARCHAR (255)   CONSTRAINT [DF_Document_Description] DEFAULT ('') NOT NULL,
    [CreatedOn]         DATETIME2 (7)    CONSTRAINT [DF_Document_Created] DEFAULT (getdate()) NOT NULL,
    [FilePath]          NVARCHAR (1024)  CONSTRAINT [DF_Document_FilePath] DEFAULT ('') NOT NULL,
    [FileName]          NVARCHAR (512)   CONSTRAINT [DF_Document_FileName] DEFAULT ('') NOT NULL,
    [DocumentType]      NVARCHAR (100)   CONSTRAINT [DF_Document_DocumentType] DEFAULT ('') NOT NULL,
    [InternalUseOnly]   BIT              CONSTRAINT [DF_Document_InternalUseOnly] DEFAULT ((0)) NOT NULL,
    [LanguageId]        UNIQUEIDENTIFIER NULL,
    [CreatedBy]         NVARCHAR (100)   CONSTRAINT [DF_Document_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]        DATETIME2 (7)    CONSTRAINT [DF_Document_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]        NVARCHAR (100)   CONSTRAINT [DF_Document_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_Document] PRIMARY KEY CLUSTERED ([Id] ASC)
);

