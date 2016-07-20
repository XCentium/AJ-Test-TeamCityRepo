CREATE TABLE [dbo].[Content] (
    [Id]                     UNIQUEIDENTIFIER CONSTRAINT [DF_Content_ContentId] DEFAULT (newsequentialid()) NOT NULL,
    [ContentManagerId]       UNIQUEIDENTIFIER NOT NULL,
    [Name]                   NVARCHAR (100)   CONSTRAINT [DF_Content_Name] DEFAULT ('') NOT NULL,
    [Type]                   NVARCHAR (50)    CONSTRAINT [DF_Content_Type] DEFAULT ('') NOT NULL,
    [Html]                   NVARCHAR (MAX)   CONSTRAINT [DF_Content_HTML] DEFAULT ('') NOT NULL,
    [SubmittedForApprovalOn] DATETIME2 (7)    NULL,
    [ApprovedOn]             DATETIME2 (7)    NULL,
    [PublishToProductionOn]  DATETIME2 (7)    NULL,
    [CreatedOn]              DATETIME2 (7)    CONSTRAINT [DF_Content_Created] DEFAULT (getdate()) NOT NULL,
    [CreatedById]            UNIQUEIDENTIFIER NULL,
    [ApprovedById]           UNIQUEIDENTIFIER NULL,
    [Revision]               INT              CONSTRAINT [DF_Content_Revision] DEFAULT ((0)) NOT NULL,
    [DeviceType]             NVARCHAR (50)    CONSTRAINT [DF_Content_DeviceType] DEFAULT ('') NOT NULL,
    [PersonaId]              UNIQUEIDENTIFIER NULL,
    [LanguageId]             UNIQUEIDENTIFIER NULL,
    [CreatedBy]              NVARCHAR (100)   CONSTRAINT [DF_Content_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]             DATETIME2 (7)    CONSTRAINT [DF_Content_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]             NVARCHAR (100)   CONSTRAINT [DF_Content_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_Content] PRIMARY KEY CLUSTERED ([Id] ASC)
);

