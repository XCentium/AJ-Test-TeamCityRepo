CREATE TABLE [dbo].[CarrierZone] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [CarrierId]  UNIQUEIDENTIFIER NOT NULL,
    [Zone]       NVARCHAR (50)    NOT NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL
);

