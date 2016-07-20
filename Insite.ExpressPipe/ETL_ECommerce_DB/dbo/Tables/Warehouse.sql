CREATE TABLE [dbo].[Warehouse] (
    [Id]                 UNIQUEIDENTIFIER CONSTRAINT [DF_Warehouse_WarehouseId] DEFAULT (newsequentialid()) NOT NULL,
    [Name]               NVARCHAR (255)   CONSTRAINT [DF_Warehouse_Name] DEFAULT ('') NOT NULL,
    [Description]        NVARCHAR (2048)  CONSTRAINT [DF_Warehouse_Description] DEFAULT ('') NOT NULL,
    [Address1]           NVARCHAR (100)   CONSTRAINT [DF_Warehouse_Address1] DEFAULT ('') NOT NULL,
    [Address2]           NVARCHAR (100)   CONSTRAINT [DF_Warehouse_Address2] DEFAULT ('') NOT NULL,
    [City]               NVARCHAR (100)   CONSTRAINT [DF_Warehouse_City] DEFAULT ('') NOT NULL,
    [State]              NVARCHAR (50)    CONSTRAINT [DF_Warehouse_State] DEFAULT ('') NOT NULL,
    [PostalCode]         NVARCHAR (50)    CONSTRAINT [DF_Warehouse_Zip] DEFAULT ('') NOT NULL,
    [ContactName]        NVARCHAR (255)   CONSTRAINT [DF_Warehouse_ContactName] DEFAULT ('') NOT NULL,
    [Phone]              NVARCHAR (50)    CONSTRAINT [DF_Warehouse_Phone] DEFAULT ('') NOT NULL,
    [ShipSite]           NVARCHAR (255)   CONSTRAINT [DF_Warehouse_ShipSite] DEFAULT ((0)) NOT NULL,
    [DeactivateOn]       DATETIME2 (7)    NULL,
    [IsDefaultWarehouse] BIT              NOT NULL,
    [CountryId]          UNIQUEIDENTIFIER NULL,
    [CreatedOn]          DATETIME2 (7)    CONSTRAINT [DF_Warehouse_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]          NVARCHAR (100)   CONSTRAINT [DF_Warehouse_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]         DATETIME2 (7)    CONSTRAINT [DF_Warehouse_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]         NVARCHAR (100)   CONSTRAINT [DF_Warehouse_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_Warehouse] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Warehouse_Country] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[Country] ([Id]),
    CONSTRAINT [IX_Warehouse_NaturalKey] UNIQUE NONCLUSTERED ([Name] ASC)
);

