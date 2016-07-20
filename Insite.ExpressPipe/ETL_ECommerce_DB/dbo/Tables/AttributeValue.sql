CREATE TABLE [dbo].[AttributeValue] (
    [Id]              UNIQUEIDENTIFIER CONSTRAINT [DF_AttributeValue_FilterValueId] DEFAULT (newsequentialid()) NOT NULL,
    [AttributeTypeId] UNIQUEIDENTIFIER NOT NULL,
    [Value]           NVARCHAR (255)   CONSTRAINT [DF_AttributeValue_Value] DEFAULT ('') NOT NULL,
    [SortOrder]       INT              CONSTRAINT [DF_AttributeValue_SortOrder] DEFAULT ((0)) NOT NULL,
    [IsActive]        BIT              CONSTRAINT [DF_AttributeValue_IsActive] DEFAULT ((1)) NOT NULL,
    [ImagePath]       NVARCHAR (1024)  CONSTRAINT [DF_AttributeValue_ImagePath] DEFAULT ('') NOT NULL,
    [CreatedOn]       DATETIME2 (7)    CONSTRAINT [DF_AttributeValue_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]       NVARCHAR (100)   CONSTRAINT [DF_AttributeValue_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]      DATETIME2 (7)    CONSTRAINT [DF_AttributeValue_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]      NVARCHAR (100)   CONSTRAINT [DF_AttributeValue_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_AttributeValue] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AttributeValue_Attribute] FOREIGN KEY ([AttributeTypeId]) REFERENCES [dbo].[AttributeType] ([Id]) ON DELETE CASCADE
);






GO



GO


