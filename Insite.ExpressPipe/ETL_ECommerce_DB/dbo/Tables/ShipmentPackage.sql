CREATE TABLE [dbo].[ShipmentPackage] (
    [Id]             UNIQUEIDENTIFIER CONSTRAINT [DF_ShipmentPackage_ShipmentPackageId] DEFAULT (newsequentialid()) NOT NULL,
    [ShipmentId]     UNIQUEIDENTIFIER NOT NULL,
    [Carrier]        NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackage_Carrier] DEFAULT ('') NOT NULL,
    [TrackingNumber] NVARCHAR (50)    CONSTRAINT [DF_ShipmentPackage_TrackingNumber] DEFAULT ('') NOT NULL,
    [Freight]        DECIMAL (18, 5)  CONSTRAINT [DF_ShipmentPackage_Freight] DEFAULT ((0)) NOT NULL,
    [PackageNumber]  NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackage_PackageNumber] DEFAULT ('') NOT NULL,
    [ShipVia]        NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackage_ShipVia] DEFAULT ('') NOT NULL,
    [CreatedOn]      DATETIME2 (7)    CONSTRAINT [DF_ShipmentPackage_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]      NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackage_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]     DATETIME2 (7)    CONSTRAINT [DF_ShipmentPackage_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     NVARCHAR (100)   CONSTRAINT [DF_ShipmentPackage_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_ShipmentPackage] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ShipmentPackage_Shipment] FOREIGN KEY ([ShipmentId]) REFERENCES [dbo].[Shipment] ([Id]) ON DELETE CASCADE
);

