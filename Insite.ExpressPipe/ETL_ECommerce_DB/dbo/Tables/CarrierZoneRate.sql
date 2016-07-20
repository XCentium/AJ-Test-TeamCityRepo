CREATE TABLE [dbo].[CarrierZoneRate] (
    [Id]            UNIQUEIDENTIFIER NOT NULL,
    [CarrierZoneId] UNIQUEIDENTIFIER NOT NULL,
    [Weight]        DECIMAL (18, 5)  NOT NULL,
    [Rate]          DECIMAL (18, 5)  NOT NULL,
    [CreatedOn]     DATETIME2 (7)    NOT NULL,
    [CreatedBy]     NVARCHAR (100)   NOT NULL,
    [ModifiedOn]    DATETIME2 (7)    NOT NULL,
    [ModifiedBy]    NVARCHAR (100)   NOT NULL
);

