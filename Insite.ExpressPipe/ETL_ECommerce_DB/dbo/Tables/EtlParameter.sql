CREATE TABLE [dbo].[EtlParameter] (
    [ETLParameterId] UNIQUEIDENTIFIER DEFAULT (newsequentialid()) NOT NULL,
    [ParameterGroup] VARCHAR (50)     NULL,
    [ParameterName]  VARCHAR (50)     NULL,
    [ParameterValue] VARCHAR (50)     NULL,
    CONSTRAINT [PK_ETLParameter] PRIMARY KEY CLUSTERED ([ETLParameterId] ASC)
);

