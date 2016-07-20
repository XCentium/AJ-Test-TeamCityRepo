CREATE TABLE [dbo].[ShipmentPackageLine] (
    [Id]                 UNIQUEIDENTIFIER CONSTRAINT [DF_ShipmentPackageLine_PackageLineId] DEFAULT (newsequentialid()) NOT NULL,
    [ShipmentPackageId]  UNIQUEIDENTIFIER NOT NULL,
    [ProductName]        NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackageLine_ProductName] DEFAULT ('') NOT NULL,
    [ProductDescription] NVARCHAR (1024)  CONSTRAINT [DF_ShipmentPackageLine_ProductDescription] DEFAULT ('') NOT NULL,
    [ProductCode]        NVARCHAR (50)    CONSTRAINT [DF_ShipmentPackageLine_ProductCode] DEFAULT ('') NOT NULL,
    [QtyOrdered]         DECIMAL (18, 5)  CONSTRAINT [DF_ShipmentPackageLine_QuantityOrdered] DEFAULT ((0)) NOT NULL,
    [QtyShipped]         DECIMAL (18, 5)  CONSTRAINT [DF_ShipmentPackageLine_QuantityShipped] DEFAULT ((0)) NOT NULL,
    [Price]              DECIMAL (18, 5)  CONSTRAINT [DF_ShipmentPackageLine_Price] DEFAULT ((0)) NOT NULL,
    [OrderLineId]        UNIQUEIDENTIFIER NULL,
    [CreatedOn]          DATETIME2 (7)    CONSTRAINT [DF_ShipmentPackageLine_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]          NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackageLine_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]         DATETIME2 (7)    CONSTRAINT [DF_ShipmentPackageLine_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackageLine_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_ShipmentPackageLine] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ShipmentPackageLine_ShipmentPackage] FOREIGN KEY ([ShipmentPackageId]) REFERENCES [dbo].[ShipmentPackage] ([Id]) ON DELETE CASCADE
);

