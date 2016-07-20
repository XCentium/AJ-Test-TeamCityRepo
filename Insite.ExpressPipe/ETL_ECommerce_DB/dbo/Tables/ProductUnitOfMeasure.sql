CREATE TABLE [dbo].[ProductUnitOfMeasure] (
    [Id]                      UNIQUEIDENTIFIER CONSTRAINT [DF_ProductUnitOfMeasure_ProductUnitOfMeasureId] DEFAULT (newsequentialid()) NOT NULL,
    [ProductId]               UNIQUEIDENTIFIER NOT NULL,
    [UnitOfMeasure]           NVARCHAR (50)    NOT NULL,
    [Description]             NVARCHAR (100)   CONSTRAINT [DF_ProductUnitOfMeasure_Description] DEFAULT ('') NOT NULL,
    [QtyPerBaseUnitOfMeasure] DECIMAL (18, 9)  CONSTRAINT [DF_ProductUnitOfMeasure_QtyPerBaseUnitOfMeasure] DEFAULT ((0)) NOT NULL,
    [RoundingRule]            NVARCHAR (50)    CONSTRAINT [DF_ProductUnitOfMeasure_RoundingRule] DEFAULT ('') NOT NULL,
    [IsDefault]               BIT              CONSTRAINT [DF_ProductUnitOfMeasure_IsDefault] DEFAULT ((0)) NOT NULL,
    [CreatedOn]               DATETIME2 (7)    CONSTRAINT [DF_ProductUnitOfMeasure_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]               NVARCHAR (100)   CONSTRAINT [DF_ProductUnitOfMeasure_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]              DATETIME2 (7)    CONSTRAINT [DF_ProductUnitOfMeasure_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]              NVARCHAR (100)   CONSTRAINT [DF_ProductUnitOfMeasure_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_ProductUnitOfMeasure] PRIMARY KEY CLUSTERED ([Id] ASC)
);

