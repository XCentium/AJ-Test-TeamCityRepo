CREATE TABLE [dbo].[ProductGeneric_Scrub] (
    [CUSTOMER_Item ID]                  VARCHAR (50)  NOT NULL,
    [CUSTOMER_Description]              VARCHAR (50)  NULL,
    [CUSTOMER_Manufacturer Part Number] VARCHAR (50)  NULL,
    [MANUFACTURER NAME]                 VARCHAR (255) NULL,
    [Generic (Y/N)]                     VARCHAR (10)  CONSTRAINT [DF_ProductGeneric_Scrub_IsGenericProduct] DEFAULT ('N') NOT NULL,
    [Generic SKU #]                     VARCHAR (20)  NULL,
    [XREF SKU]                          VARCHAR (20)  NULL,
    [Generic Product Family Code]       VARCHAR (20)  NULL,
    [Display Order]                     VARCHAR (10)  CONSTRAINT [DF_ProductGeneric_Scrub_DisplayOrder] DEFAULT ((0)) NULL,
    [Variant Dimension]                 VARCHAR (25)  NULL,
    [Value of Variant]                  VARCHAR (25)  NULL
);

