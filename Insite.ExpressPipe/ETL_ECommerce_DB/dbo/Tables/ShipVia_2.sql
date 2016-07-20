CREATE TABLE [dbo].[ShipVia] (
    [Id]                     UNIQUEIDENTIFIER NOT NULL,
    [CarrierId]              UNIQUEIDENTIFIER NOT NULL,
    [ShipCode]               NVARCHAR (50)    NOT NULL,
    [Description]            NVARCHAR (100)   NOT NULL,
    [ActivateOn]             DATETIME2 (7)    NOT NULL,
    [DeactivateOn]           DATETIME2 (7)    NULL,
    [Enable]                 BIT              NOT NULL,
    [ErpShipCode]            NVARCHAR (50)    NOT NULL,
    [ChargeAmount]           DECIMAL (18, 5)  NOT NULL,
    [FlatFee]                DECIMAL (18, 5)  NOT NULL,
    [MinimumFee]             DECIMAL (18, 5)  NOT NULL,
    [IsDefault]              BIT              NOT NULL,
    [AllowScheduledShipDate] BIT              NOT NULL,
    [CreatedOn]              DATETIME2 (7)    NOT NULL,
    [CreatedBy]              NVARCHAR (100)   NOT NULL,
    [ModifiedOn]             DATETIME2 (7)    NOT NULL,
    [ModifiedBy]             NVARCHAR (100)   NOT NULL
);

