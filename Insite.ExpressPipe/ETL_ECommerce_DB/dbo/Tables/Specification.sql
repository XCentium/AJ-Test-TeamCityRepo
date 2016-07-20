CREATE TABLE [dbo].[Specification] (
    [Id]               UNIQUEIDENTIFIER CONSTRAINT [DF_Specification_SpecificationId] DEFAULT (newsequentialid()) NOT NULL,
    [ParentId]         UNIQUEIDENTIFIER NULL,
    [ContentManagerId] UNIQUEIDENTIFIER NULL,
    [Name]             NVARCHAR (100)   CONSTRAINT [DF_Specification_Name] DEFAULT ('') NOT NULL,
    [SortOrder]        DECIMAL (18, 5)  CONSTRAINT [DF_Specification_SortOrder] DEFAULT ((0)) NOT NULL,
    [Description]      NVARCHAR (512)   CONSTRAINT [DF_Specification_Description] DEFAULT ('') NOT NULL,
    [IsActive]         BIT              CONSTRAINT [DF_Specification_Active] DEFAULT ((1)) NOT NULL,
    [Value]            NVARCHAR (MAX)   CONSTRAINT [DF_Specification_Value] DEFAULT ('') NOT NULL,
    [CreatedOn]        DATETIME2 (7)    CONSTRAINT [DF_Specification_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]        NVARCHAR (100)   CONSTRAINT [DF_Specification_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]       DATETIME2 (7)    CONSTRAINT [DF_Specification_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]       NVARCHAR (100)   CONSTRAINT [DF_Specification_ModifiedBy] DEFAULT ('') NOT NULL,
    [ERPNumber]        NVARCHAR (50)    NULL,
    CONSTRAINT [PK_Specification] PRIMARY KEY CLUSTERED ([Id] ASC)
);



