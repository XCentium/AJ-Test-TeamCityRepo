CREATE TABLE [dbo].[Country] (
    [Id]                    UNIQUEIDENTIFIER CONSTRAINT [DF_Country_CountryId] DEFAULT (newsequentialid()) NOT NULL,
    [Name]                  NVARCHAR (100)   CONSTRAINT [DF_Country_Name] DEFAULT ('') NOT NULL,
    [Abbreviation]          NVARCHAR (32)    CONSTRAINT [DF_Country_Abbreviation] DEFAULT ('') NOT NULL,
    [IsActive]              BIT              CONSTRAINT [DF_Country_IsActive] DEFAULT ((0)) NOT NULL,
    [ISOCode2]              NVARCHAR (50)    CONSTRAINT [DF_Country_ISOCode2] DEFAULT ('') NOT NULL,
    [ISOCode3]              NVARCHAR (50)    CONSTRAINT [DF_Country_ISOCode3] DEFAULT ('') NOT NULL,
    [ISONumber]             NVARCHAR (50)    CONSTRAINT [DF_Country_ISONumber] DEFAULT ('') NOT NULL,
    [DistanceUnitOfMeasure] NVARCHAR (50)    CONSTRAINT [DF_Country_DistanceUnitOfMeasure] DEFAULT ('Imperial') NOT NULL,
    [CreatedOn]             DATETIME2 (7)    CONSTRAINT [DF_Country_CreatedOn] DEFAULT (getdate()) NOT NULL,
    [CreatedBy]             NVARCHAR (100)   CONSTRAINT [DF_Country_CreatedBy] DEFAULT ('') NOT NULL,
    [ModifiedOn]            DATETIME2 (7)    CONSTRAINT [DF_Country_ModifiedOn] DEFAULT (getdate()) NOT NULL,
    [ModifiedBy]            NVARCHAR (100)   CONSTRAINT [DF_Country_ModifiedBy] DEFAULT ('') NOT NULL,
    CONSTRAINT [PK_Country] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [CK_Country_Name] CHECK (len([Name])>(0))
);

