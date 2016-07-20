CREATE TABLE [dbo].[CategoryAttributeType] (
    [Id]                    UNIQUEIDENTIFIER CONSTRAINT [DF_CategoryAttributeType_CategoryAttributeTypeId] DEFAULT (newsequentialid()) NOT NULL,
    [CategoryId]            UNIQUEIDENTIFIER NOT NULL,
    [AttributeTypeId]       UNIQUEIDENTIFIER NOT NULL,
    [SortOrder]             INT              CONSTRAINT [DF_CategoryAttributeType_SortOrder] DEFAULT ((0)) NOT NULL,
    [IsActive]              BIT              CONSTRAINT [DF_CategoryAttributeType_IsActive] DEFAULT ((1)) NOT NULL,
    [DetailDisplaySequence] TINYINT          CONSTRAINT [DF_CategoryAttributeType_DetailDisplaySequence] DEFAULT (NULL) NULL,
    [CreatedOn]             DATETIME2 (7)    CONSTRAINT [DF_CategoryAttributeType_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]             NVARCHAR (100)   CONSTRAINT [DF_CategoryAttributeType_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]            DATETIME2 (7)    CONSTRAINT [DF_CategoryAttributeType_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            NVARCHAR (100)   CONSTRAINT [DF_CategoryAttributeType_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_CategoryAttributeType] PRIMARY KEY CLUSTERED ([Id] ASC)
);

