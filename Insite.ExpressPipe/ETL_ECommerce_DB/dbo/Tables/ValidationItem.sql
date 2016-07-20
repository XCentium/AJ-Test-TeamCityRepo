CREATE TABLE [dbo].[ValidationItem] (
    [Id]             UNIQUEIDENTIFIER DEFAULT (newid()) NULL,
    [TableName]      [sysname]        NOT NULL,
    [HasEtlSourceID] BIT              NULL,
    [LastCount]      INT              NULL,
    [VarianceType]   VARCHAR (10)     NULL,
    [VarianceAmount] DECIMAL (18)     NULL
);

