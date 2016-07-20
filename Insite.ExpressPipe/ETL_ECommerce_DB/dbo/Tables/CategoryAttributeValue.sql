CREATE TABLE [dbo].[CategoryAttributeValue] (
    [CategoryId]       UNIQUEIDENTIFIER NOT NULL,
    [AttributeValueId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_CategoryAttributeValue] PRIMARY KEY CLUSTERED ([CategoryId] ASC, [AttributeValueId] ASC)
);

