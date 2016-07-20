CREATE TABLE [dbo].[CarrierPackage] (
    [Id]         UNIQUEIDENTIFIER NOT NULL,
    [CarrierId]  UNIQUEIDENTIFIER NOT NULL,
    [Name]       NVARCHAR (50)    NOT NULL,
    [Length]     DECIMAL (18, 5)  NOT NULL,
    [Width]      DECIMAL (18, 5)  NOT NULL,
    [Height]     DECIMAL (18, 5)  NOT NULL,
    [Weight]     DECIMAL (18, 5)  NOT NULL,
    [IsActive]   BIT              NOT NULL,
    [CreatedOn]  DATETIME2 (7)    NOT NULL,
    [CreatedBy]  NVARCHAR (100)   NOT NULL,
    [ModifiedOn] DATETIME2 (7)    NOT NULL,
    [ModifiedBy] NVARCHAR (100)   NOT NULL
);

