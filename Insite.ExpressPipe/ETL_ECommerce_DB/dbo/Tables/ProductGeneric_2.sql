CREATE TABLE [dbo].[ProductGeneric] (
    [Id]                             UNIQUEIDENTIFIER CONSTRAINT [DF_GenericProduct_Id] DEFAULT (newid()) NOT NULL,
    [CustomerItemId]                 VARCHAR (50)     NOT NULL,
    [CustomerDescription]            VARCHAR (50)     NULL,
    [CustomerManufacturerPartNumber] VARCHAR (50)     NULL,
    [ManufacturerName]               VARCHAR (255)    NULL,
    [IsGenericProduct]               CHAR (1)         CONSTRAINT [DF_ProductGeneric_IsGenericProduct] DEFAULT ('N') NOT NULL,
    [GenericSKU]                     VARCHAR (20)     NULL,
    [XrefSKU]                        VARCHAR (20)     NULL,
    [GenericProductFamilyCode]       VARCHAR (20)     NULL,
    [DisplayOrder]                   INT              CONSTRAINT [DF_ProductGeneric_DisplayOrder] DEFAULT ((0)) NULL,
    [VariantDimension]               VARCHAR (25)     NULL,
    [ValueOfVariant]                 VARCHAR (25)     NULL,
    [CreatedOn]                      DATETIME2 (7)    NOT NULL,
    [CreatedBy]                      VARCHAR (100)    NOT NULL,
    [ModifiedOn]                     DATETIME2 (7)    NULL,
    [ModifiedBy]                     VARCHAR (100)    NULL
);

