CREATE TABLE [dbo].[Shipment] (
    [Id]             UNIQUEIDENTIFIER CONSTRAINT [DF_Shipment_ShipmentId] DEFAULT (newsequentialid()) NOT NULL,
    [ShipmentNumber] NVARCHAR (50)    CONSTRAINT [DF_Shipment_ShipmentNumber] DEFAULT ('') NOT NULL,
    [ShipmentDate]   DATETIME2 (7)    CONSTRAINT [DF_Shipment_ShipmentDate] DEFAULT (getdate()) NOT NULL,
    [EmailSentDate]  DATETIME2 (7)    NULL,
    [ASNSentDate]    DATETIME2 (7)    NULL,
    [WebOrderNumber] NVARCHAR (50)    CONSTRAINT [DF_Shipment_WebOrderNumber] DEFAULT ('') NOT NULL,
    [ERPOrderNumber] NVARCHAR (50)    CONSTRAINT [DF_Shipment_ERPOrderNumber] DEFAULT ('') NOT NULL,
    [CreatedOn]      DATETIME2 (7)    CONSTRAINT [DF_Shipment_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]      NVARCHAR (100)   CONSTRAINT [DF_Shipment_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]     DATETIME2 (7)    CONSTRAINT [DF_Shipment_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]     NVARCHAR (100)   CONSTRAINT [DF_Shipment_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_Shipment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

