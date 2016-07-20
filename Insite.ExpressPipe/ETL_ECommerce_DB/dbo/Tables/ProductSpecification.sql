CREATE TABLE [dbo].[ProductSpecification] (
    [ProductId]       UNIQUEIDENTIFIER NOT NULL,
    [SpecificationId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_ProductSpecification] PRIMARY KEY CLUSTERED ([ProductId] ASC, [SpecificationId] ASC)
);

