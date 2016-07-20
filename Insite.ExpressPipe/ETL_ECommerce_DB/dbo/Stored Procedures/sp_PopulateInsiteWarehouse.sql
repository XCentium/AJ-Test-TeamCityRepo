CREATE PROCEDURE [dbo].[sp_PopulateInsiteWarehouse]
--*****************************************************************************************************************
-- Name:	sp_PopulateInsiteWarehouse
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteWarehouse] 'EXP'
--*****************************************************************************************************************
(
	
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION



			;MERGE [Insite.Morsco]..Warehouse AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Warehouse AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.Name <> Source.Name
				OR Target.Description <> Source.Description
				OR Target.Address1 <> Source.Address1
				OR Target.Address2 <> Source.Address2
				OR Target.City <> Source.City
				OR Target.State <> Source.State
				OR Target.PostalCode <> Source.PostalCode
				OR Target.ContactName <> Source.ContactName
				OR Target.Phone <> Source.Phone
				OR Target.ShipSite <> Source.ShipSite
				OR ISNULL(Target.DeactivateOn,'1/1/1900') <> ISNULL(Source.DeactivateOn,'1/1/1900')
				OR Target.IsDefaultWarehouse <> Source.IsDefaultWarehouse
				OR ISNULL(Target.CountryId,'00000000-0000-0000-0000-000000000000') <> ISNULL(Source.CountryId,'00000000-0000-0000-0000-000000000000')
			) THEN
			UPDATE SET 
				Target.Name = Source.Name,
				Target.Description = Source.Description,
				Target.Address1 = Source.Address1,
				Target.Address2 = Source.Address2,
				Target.City = Source.City,
				Target.State = Source.State,
				Target.PostalCode = Source.PostalCode,
				Target.ContactName = Source.ContactName,
				Target.Phone = Source.Phone,
				Target.ShipSite = Source.ShipSite,
				Target.DeactivateOn = Source.DeactivateOn,
				Target.IsDefaultWarehouse = Source.IsDefaultWarehouse,
				Target.CountryId = Source.CountryId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      Name,
			      Description,
			      Address1,
			      Address2,
			      City,
			      State,
			      PostalCode,
			      ContactName,
			      Phone,
			      ShipSite,
			      DeactivateOn,
			      IsDefaultWarehouse,
			      CountryId,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.Name,
			   Source.Description,
			   Source.Address1,
			   Source.Address2,
			   Source.City,
			   Source.State,
			   Source.PostalCode,
			   Source.ContactName,
			   Source.Phone,
			   Source.ShipSite,
			   Source.DeactivateOn,
			   Source.IsDefaultWarehouse,
			   Source.CountryId,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			--DELETE;
			UPDATE SET Target.DeactivateOn = GETDATE();

	
		/*****************************************************************************************************************
		ShipVia table merge statement
		******************************************************************************************************************/
		;WITH CTE AS
		(SELECT S.* from [Insite.Morsco]..Carrier C 
				JOIN [Insite.Morsco]..ShipVia S on C.Id = S.CarrierId
				WHERE C.Description = 'Will Call')
		MERGE CTE AS Target
			USING
			(
				SELECT * from ShipVia
			) Source
			ON Target.Id = Source.Id 
		WHEN MATCHED AND 
			(
				Target.CarrierId <> Source.CarrierId
				OR Target.ShipCode <> Source.ShipCode
				OR Target.Description <> Source.Description
				OR Target.ActivateOn <> Source.ActivateOn
				OR ISNULL(Target.DeactivateOn,'1/1/1900') <> ISNULL(Source.DeactivateOn,'1/1/1900')
				OR Target.Enable <> Source.Enable
				OR Target.ErpShipCode <> Source.ErpShipCode
				OR Target.ChargeAmount <> Source.ChargeAmount
				OR Target.FlatFee <> Source.FlatFee
				OR Target.MinimumFee <> Source.MinimumFee
				OR Target.IsDefault <> Source.IsDefault
				OR Target.AllowScheduledShipDate <> Source.AllowScheduledShipDate
			) THEN
			UPDATE SET 
				Target.CarrierId = Source.CarrierId,
				Target.ShipCode = Source.ShipCode,
				Target.Description = Source.Description,
				Target.ActivateOn = Source.ActivateOn,
				Target.DeactivateOn = Source.DeactivateOn,
				Target.Enable = Source.Enable,
				Target.ErpShipCode = Source.ErpShipCode,
				Target.ChargeAmount = Source.ChargeAmount,
				Target.FlatFee = Source.FlatFee,
				Target.MinimumFee = Source.MinimumFee,
				Target.IsDefault = Source.IsDefault,
				Target.AllowScheduledShipDate = Source.AllowScheduledShipDate,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      CarrierId,
			      ShipCode,
			      Description,
			      ActivateOn,
			      DeactivateOn,
			      Enable,
			      ErpShipCode,
			      ChargeAmount,
			      FlatFee,
			      MinimumFee,
			      IsDefault,
			      AllowScheduledShipDate,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.CarrierId,
			   Source.ShipCode,
			   Source.Description,
			   Source.ActivateOn,
			   Source.DeactivateOn,
			   Source.Enable,
			   Source.ErpShipCode,
			   Source.ChargeAmount,
			   Source.FlatFee,
			   Source.MinimumFee,
			   Source.IsDefault,
			   Source.AllowScheduledShipDate,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET Target.DeactivateOn = GETDATE();

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END