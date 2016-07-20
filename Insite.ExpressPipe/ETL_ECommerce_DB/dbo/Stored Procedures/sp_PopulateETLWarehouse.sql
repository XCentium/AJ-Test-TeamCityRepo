
CREATE PROCEDURE [dbo].[sp_PopulateETLWarehouse]
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLWarehouse]
-- Descr:	Executes all the warehouse data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLWarehouse] 'EXP', 'ServiceUser', 'InsiteCommerce'
--*****************************************************************************************************************
BEGIN
		SET NOCOUNT ON;

		SET XACT_ABORT ON;

		DECLARE @CountryID UNIQUEIDENTIFIER = (SELECT Id FROM [Insite.Morsco].dbo.Country C WHERE C.ISOCode3 = 'USA')

		TRUNCATE TABLE [dbo].[Warehouse];

		;WITH DupeBranch AS
		(
			   SELECT 
					  Row_Number() OVER (PARTITION BY BranchId ORDER BY ExportDate DESC) RowNumber,
					  *
			   FROM DM_ECommerce..Branch (NOLOCK) 
			   WHERE EtlSourceId = @ETLSourceID 
			     AND StockingBranch = 1
		)
		INSERT INTO [dbo].[Warehouse]
			([Id]
			,[Name]
			,[Description]
			,[Address1]
			,[Address2]
			,[City]
			,[State]
			,[PostalCode]
			,[ContactName]
			,[Phone]
			,[ShipSite]
			,[DeactivateOn]
			,[IsDefaultWarehouse]
			,[CountryId]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy])
		SELECT 
			NEWID() Id
			,[dbo].[fn_InitialCap](Name) + '(' + BranchID + ')'
			,[dbo].[fn_InitialCap](Name) [Description]
			,ISNULL([Address1],'')
			,ISNULL([Address2],'')
			,ISNULL([City],'')
			,ISNULL([State],'')
			,ISNULL(Zip,'') [PostalCode]
			,ISNULL([BranchManager],'') ContactName
			,ISNULL([PhoneNumber],'') Phone
			,ISNULL(BranchId,'') ShipSite
			,CASE WHEN [StockingBranch] = 1 THEN NULL ELSE GETDATE() END [DeactivateOn]
			,0 [IsDefaultWarehouse]
			,@CountryId CountryId
			,GETDATE() CreatedOn
			,@UserName CreatedBy
			,Getdate() ModifiedOn
			,@UserName ModifiedBy
		FROM DupeBranch 
		WHERE Rownumber = 1

		--Update the existing Ids from Insite DB
		Update EWH Set EWH.Id = IWH.id 
		  from Warehouse EWH 
	INNER JOIN [Insite.Morsco]..Warehouse IWH (NOLOCK) 
		    ON EWH.Name = IWH.Name

	/***********************************************************************************************************************

	************************************************************************************************************************/

		DELETE FROM ShipVia WHERE Description <> 'ShipItem';

		DECLARE @CarrierId AS UNIQUEIDENTIFIER;
		SELECT @CarrierID = ID From Carrier where Name = 'Will Call';
		SELECT  ID From Carrier where Name = 'Will Call';

		INSERT INTO [dbo].[ShipVia]
			([Id]
			,[CarrierId]
			,[ShipCode]
			,[Description]
			,[ActivateOn]
			,[DeactivateOn]
			,[Enable]
			,[ErpShipCode]
			,[ChargeAmount]
			,[FlatFee]
			,[MinimumFee]
			,[IsDefault]
			,[AllowScheduledShipDate]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy])
		SELECT NEWID() AS ID
			,@CarrierId as CarrierId
			,BranchId as ShipCode
			,[dbo].[fn_InitialCap](Name) as Description
			,Getdate() as ActivateOn
			,NULL as DeactivateOn
			,1 Enable
			,BranchId ERPShipCode 
			,0.00 CHargeAmount
			,0.00 FlatFee
			,0.00 MinimumFee 
			,0 IsDefault
			,1 AllowScheduledShipDate
			,Getdate() CreatedOn
			,@UserName CreatedBy
			,Getdate() ModifiedOn
			,@UserName ModifiedBy
	    FROM DM_ECommerce..Branch (NOLOCK)  
	    WHERE ETLSourceID = @ETLSourceID 
		AND StockingBranch = '1'

		--*********************************************************************************************************
		-- UPdate the existing Ids
		--*********************************************************************************************************
		--Update the existing Ids from Insite DB
		Update ESV Set ESV.Id = ISV.id
		  from ShipVia ESV 
	INNER JOIN [Insite.Morsco]..ShipVia ISV (NOLOCK) 
		    ON ESV.CarrierId = ISV.CarrierId AND ESV.ShipCode = ISV.ShipCode AND ESV.Description = ISV.Description
END