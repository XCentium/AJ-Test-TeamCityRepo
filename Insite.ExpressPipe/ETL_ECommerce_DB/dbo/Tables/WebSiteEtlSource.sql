CREATE TABLE [dbo].[WebSiteEtlSource] (
    [WebSiteEtlSourceID] INT              IDENTITY (1, 1) NOT NULL,
    [WebSiteId]          UNIQUEIDENTIFIER NOT NULL,
    [ETLSourceID]        VARCHAR (5)      NOT NULL
);

