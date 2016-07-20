CREATE TABLE [dbo].[ProductAttributeValue] (
    [ProductId]        UNIQUEIDENTIFIER NOT NULL,
    [AttributeValueId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_ProductAttributeValue] PRIMARY KEY CLUSTERED ([ProductId] ASC, [AttributeValueId] ASC)
);

