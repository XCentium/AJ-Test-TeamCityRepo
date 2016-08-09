USE [insite.morsco]
GO


IF NOT EXISTS ( SELECT * FROM WebSiteConfiguration
					   WHERE Name = 'MSC_OpcoTerritory')
	BEGIN
		INSERT INTO [dbo].[WebSiteConfiguration]
				   ([WebSiteId]
				   ,[Name]
				   ,[Value]
				   ,[Description]
				   ,[CreatedOn]
				   ,[CreatedBy]
				   ,[ModifiedOn]
				   ,[ModifiedBy])
			 VALUES
				   ('C2C53320-98DC-4ECA-8022-9EFC00DEA0DC'
				   ,'MSC_OpcoTerritory'
				   ,'ExpALL'
				   ,'Opco Territory'
				   ,GetDate()
				   ,'Admin'
				   ,GetDate()
				   ,'Admin')
	END
