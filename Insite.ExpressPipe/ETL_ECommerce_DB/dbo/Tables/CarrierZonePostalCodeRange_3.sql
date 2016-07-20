CREATE TABLE [dbo].[CarrierZonePostalCodeRange] (
    [Id]                   UNIQUEIDENTIFIER NOT NULL,
    [CarrierZoneId]        UNIQUEIDENTIFIER NOT NULL,
    [PostalCodeStartRange] NVARCHAR (50)    NOT NULL,
    [PostalCodeEndRange]   NVARCHAR (50)    NOT NULL,
    [CreatedOn]            DATETIME2 (7)    NOT NULL,
    [CreatedBy]            NVARCHAR (100)   NOT NULL,
    [ModifiedOn]           DATETIME2 (7)    NOT NULL,
    [ModifiedBy]           NVARCHAR (100)   NOT NULL
);

