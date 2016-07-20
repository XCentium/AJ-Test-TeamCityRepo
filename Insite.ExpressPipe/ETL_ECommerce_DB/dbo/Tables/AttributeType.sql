CREATE TABLE [dbo].[AttributeType] (
    [Id]           UNIQUEIDENTIFIER CONSTRAINT [DF_AttributeType_Id] DEFAULT (newsequentialid()) NOT NULL,
    [Name]         NVARCHAR (255)   CONSTRAINT [DF_AttributeType_Name] DEFAULT ('') NOT NULL,
    [IsActive]     BIT              CONSTRAINT [DF_AttributeType_IsActive] DEFAULT ((1)) NOT NULL,
    [Label]        NVARCHAR (1024)  CONSTRAINT [DF_AttributeType_Label] DEFAULT ('') NOT NULL,
    [IsFilter]     BIT              CONSTRAINT [DF_AttributeType_IsFilter] DEFAULT ((1)) NOT NULL,
    [IsComparable] BIT              CONSTRAINT [DF_AttributeType_IsComparable] DEFAULT ((0)) NOT NULL,
    [CreatedOn]    DATETIME2 (7)    CONSTRAINT [DF_AttributeType_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]    NVARCHAR (100)   CONSTRAINT [DF_AttributeType_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]   DATETIME2 (7)    CONSTRAINT [DF_AttributeType_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]   NVARCHAR (100)   CONSTRAINT [DF_AttributeType_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_AttributeType] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [CK_AttributeType_Name] CHECK (len([Name])>(0))
);






GO



GO


