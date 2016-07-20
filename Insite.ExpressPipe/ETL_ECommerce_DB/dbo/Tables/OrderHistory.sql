CREATE TABLE [dbo].[OrderHistory] (
    [Id]                  UNIQUEIDENTIFIER CONSTRAINT [DF_OrderHistory_OrderHistoryId] DEFAULT (newsequentialid()) NOT NULL,
    [ERPOrderNumber]      NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_ERPOrderNumber] DEFAULT ('') NOT NULL,
    [WebOrderNumber]      NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_WebOrderNumber] DEFAULT ('') NOT NULL,
    [OrderDate]           DATETIME2 (7)    CONSTRAINT [DF_OrderHistory_OrderDate] DEFAULT (getdate()) NOT NULL,
    [Status]              NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_Status] DEFAULT ('') NOT NULL,
    [CustomerNumber]      NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_CustomerNumber] DEFAULT ('') NOT NULL,
    [CustomerSequence]    NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_CustomerSequence] DEFAULT ('') NOT NULL,
    [CustomerPO]          NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_CustomerPO] DEFAULT ('') NOT NULL,
    [CurrencyCode]        NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_CurrencyCode] DEFAULT ('') NOT NULL,
    [Terms]               NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_Terms] DEFAULT ('') NOT NULL,
    [ShipCode]            NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_ShipCode] DEFAULT ('') NOT NULL,
    [Salesperson]         NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_Salesperson] DEFAULT ('') NOT NULL,
    [BTCompanyName]       NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_BTCompanyName] DEFAULT ('') NOT NULL,
    [BTAddress1]          NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_BTAddress1] DEFAULT ('') NOT NULL,
    [BTAddress2]          NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_BTAddress2] DEFAULT ('') NOT NULL,
    [BTCity]              NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_BTCity] DEFAULT ('') NOT NULL,
    [BTState]             NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_BTState] DEFAULT ('') NOT NULL,
    [BTPostalCode]        NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_BTPostalCode] DEFAULT ('') NOT NULL,
    [BTCountry]           NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_BTCountry] DEFAULT ('') NOT NULL,
    [STCompanyName]       NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_STCompanyName] DEFAULT ('') NOT NULL,
    [STAddress1]          NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_STAddress1] DEFAULT ('') NOT NULL,
    [STAddress2]          NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_STAddress2] DEFAULT ('') NOT NULL,
    [STCity]              NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_STCity] DEFAULT ('') NOT NULL,
    [STState]             NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_STState] DEFAULT ('') NOT NULL,
    [STPostalCode]        NVARCHAR (50)    CONSTRAINT [DF_OrderHistory_STPostalCode] DEFAULT ('') NOT NULL,
    [STCountry]           NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_STCountry] DEFAULT ('') NOT NULL,
    [Notes]               NVARCHAR (MAX)   CONSTRAINT [DF_OrderHistory_Notes] DEFAULT ('') NOT NULL,
    [ProductTotal]        DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_ProductTotal] DEFAULT ((0)) NOT NULL,
    [DiscountAmount]      DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_DiscountAmount] DEFAULT ((0)) NOT NULL,
    [ShippingAndHandling] DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_ShippingAndHandling] DEFAULT ((0)) NOT NULL,
    [OtherCharges]        DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_OtherCharges] DEFAULT ((0)) NOT NULL,
    [TaxAmount]           DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_TaxAmount] DEFAULT ((0)) NOT NULL,
    [OrderTotal]          DECIMAL (18, 5)  NOT NULL,
    [ModifiedOn]          DATETIME2 (7)    CONSTRAINT [DF_OrderHistory_ModifyDate] DEFAULT (getdate()) NOT NULL,
    [ConversionRate]      DECIMAL (18, 5)  CONSTRAINT [DF_OrderHistory_ConversionRate] DEFAULT ((0)) NULL,
    [CreatedOn]           DATETIME2 (7)    CONSTRAINT [DF_OrderHistory_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]           NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedBy]          NVARCHAR (100)   CONSTRAINT [DF_OrderHistory_ModifiedBy] DEFAULT ('') NOT NULL,
    [OrderedBy]           NVARCHAR (100)   NULL,
    [GenerationCount]     INT              NULL,
    [InvoiceDate]         DATETIME         NULL,
    [EclipseID]           NCHAR (50)       NULL,
    [GenerationID]        NCHAR (10)       NULL,
    CONSTRAINT [PK_OrderHistory] PRIMARY KEY CLUSTERED ([Id] ASC)
);









