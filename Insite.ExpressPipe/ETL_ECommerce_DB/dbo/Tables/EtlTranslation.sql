CREATE TABLE [dbo].[EtlTranslation] (
    [ETLTranslationID] UNIQUEIDENTIFIER DEFAULT (newsequentialid()) NOT NULL,
    [ETLSourceID]      VARCHAR (5)      NULL,
    [TargetColumn]     [sysname]        NOT NULL,
    [TargetValue]      VARCHAR (100)    NULL,
    [TranslatedValue]  VARCHAR (100)    NULL,
    CONSTRAINT [PK_EtlTranslation] PRIMARY KEY CLUSTERED ([ETLTranslationID] ASC)
);




GO


