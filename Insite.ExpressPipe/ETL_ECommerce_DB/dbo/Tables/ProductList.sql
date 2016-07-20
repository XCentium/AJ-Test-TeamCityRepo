CREATE TABLE [dbo].[ProductList] (
    [Id]                UNIQUEIDENTIFIER DEFAULT (newsequentialid()) NOT NULL,
    [ProductListTypeId] UNIQUEIDENTIFIER NOT NULL,
    [CustomerId]        UNIQUEIDENTIFIER NULL,
    [ProductId]         UNIQUEIDENTIFIER NOT NULL,
    [CustomerNumber]    NVARCHAR (50)    NULL,
    [CustomerSequence]  NVARCHAR (50)    NULL,
    [ProductErpNumber]  NVARCHAR (50)    NOT NULL,
    [Frequency]         INT              NOT NULL,
    [CreatedOn]         DATETIME2 (7)    NOT NULL,
    [CreatedBy]         NVARCHAR (100)   NOT NULL,
    [ModifiedOn]        DATETIME2 (7)    NOT NULL,
    [ModifiedBy]        NVARCHAR (100)   NOT NULL,
    [QtyOrdered]        INT              DEFAULT ((0)) NOT NULL,
    [QtyShipped]        INT              DEFAULT ((0)) NOT NULL,
    [LastOrderedDate]   DATETIME         NULL,
    [LastShippedDate]   DATETIME         NULL,
    CONSTRAINT [PK_ProductPurchaseFrequency] PRIMARY KEY CLUSTERED ([Id] ASC)
);



