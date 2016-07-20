CREATE PROCEDURE [dbo].[sp_PopulateInsiteCustomer]
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE [Insite.ExpressPipe]..Customer AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..Customer AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.ParentId <> Source.ParentId
				OR Target.CustomerNumber <> Source.CustomerNumber
				OR Target.CustomerSequence <> Source.CustomerSequence
				OR Target.CustomerType <> Source.CustomerType
				OR Target.CompanyName <> Source.CompanyName
				OR Target.ContactFullName <> Source.ContactFullName
				OR Target.FirstName <> Source.FirstName
				OR Target.MiddleName <> Source.MiddleName
				OR Target.LastName <> Source.LastName
				OR Target.Phone <> Source.Phone
				OR Target.Fax <> Source.Fax
				OR Target.TermsCode <> Source.TermsCode
				OR Target.ShipCode <> Source.ShipCode
				OR Target.BankCode <> Source.BankCode
				OR Target.TaxCode1 <> Source.TaxCode1
				OR Target.TaxCode2 <> Source.TaxCode2
				OR Target.PriceCode <> Source.PriceCode
				OR Target.CurrencyCode <> Source.CurrencyCode
				OR Target.EndUserType <> Source.EndUserType
				OR Target.ShipSite <> Source.ShipSite
				OR Target.ShipEarly <> Source.ShipEarly
				OR Target.ShipPartial <> Source.ShipPartial
				OR Target.Address1 <> Source.Address1
				OR Target.Address2 <> Source.Address2
				OR Target.Address3 <> Source.Address3
				OR Target.Address4 <> Source.Address4
				OR Target.City <> Source.City
				OR Target.State <> Source.State
				OR Target.PostalCode <> Source.PostalCode
				OR Target.Country <> Source.Country
				OR Target.CreditHold <> Source.CreditHold
				OR Target.CreditLimit <> Source.CreditLimit
				OR Target.Email <> Source.Email
				OR Target.Distance <> Source.Distance
				OR Target.DiscountPercent <> Source.DiscountPercent
				OR Target.SendEmail <> Source.SendEmail
				OR Target.LogoImagePath <> Source.LogoImagePath
				OR Target.IsActive <> Source.IsActive
				OR Target.AllowDropShip <> Source.AllowDropShip
				OR Target.DropShipFeeRequired <> Source.DropShipFeeRequired
				OR Target.IsDropShip <> Source.IsDropShip
				OR Target.StateId <> Source.StateId
				OR Target.CountryId <> Source.CountryId
				OR Target.IsGuest <> Source.IsGuest
				OR Target.ERPNumber <> Source.ERPNumber
				OR Target.Territory <> Source.Territory
				OR Target.CustomLandingPage <> Source.CustomLandingPage
				OR Target.BudgetEnforcementLevel <> Source.BudgetEnforcementLevel
				OR Target.CostCodeDescription <> Source.CostCodeDescription
				OR Target.DefaultCostCode <> Source.DefaultCostCode
				OR Target.IgnoreProductRestrictions <> Source.IgnoreProductRestrictions
				OR Target.ERPSequence <> Source.ERPSequence
				OR Target.PricingCustomerId <> Source.PricingCustomerId
				OR Target.ModifedOn <> Source.ModifedOn
				OR Target.CurrencyId <> Source.CurrencyId
				OR Target.PrimarySalespersonId <> Source.PrimarySalespersonId
				OR Target.IsBillTo <> Source.IsBillTo
				OR Target.IsShipTo <> Source.IsShipTo
				OR Target.IsSoldTo <> Source.IsSoldTo
				OR Target.DefaultWarehouseId <> Source.DefaultWarehouseId
			) THEN
			UPDATE SET 
				Target.ParentId = Source.ParentId,
				Target.CustomerNumber = Source.CustomerNumber,
				Target.CustomerSequence = Source.CustomerSequence,
				Target.CustomerType = Source.CustomerType,
				Target.CompanyName = Source.CompanyName,
				Target.ContactFullName = Source.ContactFullName,
				Target.FirstName = Source.FirstName,
				Target.MiddleName = Source.MiddleName,
				Target.LastName = Source.LastName,
				Target.Phone = Source.Phone,
				Target.Fax = Source.Fax,
				Target.TermsCode = Source.TermsCode,
				Target.ShipCode = Source.ShipCode,
				Target.BankCode = Source.BankCode,
				Target.TaxCode1 = Source.TaxCode1,
				Target.TaxCode2 = Source.TaxCode2,
				Target.PriceCode = Source.PriceCode,
				Target.CurrencyCode = Source.CurrencyCode,
				Target.EndUserType = Source.EndUserType,
				Target.ShipSite = Source.ShipSite,
				Target.ShipEarly = Source.ShipEarly,
				Target.ShipPartial = Source.ShipPartial,
				Target.Address1 = Source.Address1,
				Target.Address2 = Source.Address2,
				Target.Address3 = Source.Address3,
				Target.Address4 = Source.Address4,
				Target.City = Source.City,
				Target.State = Source.State,
				Target.PostalCode = Source.PostalCode,
				Target.Country = Source.Country,
				Target.CreditHold = Source.CreditHold,
				Target.CreditLimit = Source.CreditLimit,
				Target.Email = Source.Email,
				Target.Distance = Source.Distance,
				Target.DiscountPercent = Source.DiscountPercent,
				Target.SendEmail = Source.SendEmail,
				Target.LogoImagePath = Source.LogoImagePath,
				Target.IsActive = Source.IsActive,
				Target.AllowDropShip = Source.AllowDropShip,
				Target.DropShipFeeRequired = Source.DropShipFeeRequired,
				Target.IsDropShip = Source.IsDropShip,
				Target.StateId = Source.StateId,
				Target.CountryId = Source.CountryId,
				Target.IsGuest = Source.IsGuest,
				Target.ERPNumber = Source.ERPNumber,
				Target.Territory = Source.Territory,
				Target.CustomLandingPage = Source.CustomLandingPage,
				Target.BudgetEnforcementLevel = Source.BudgetEnforcementLevel,
				Target.CostCodeDescription = Source.CostCodeDescription,
				Target.DefaultCostCode = Source.DefaultCostCode,
				Target.IgnoreProductRestrictions = Source.IgnoreProductRestrictions,
				Target.ERPSequence = Source.ERPSequence,
				Target.PricingCustomerId = Source.PricingCustomerId,
				Target.ModifedOn = Source.ModifedOn,
				Target.CurrencyId = Source.CurrencyId,
				Target.PrimarySalespersonId = Source.PrimarySalespersonId,
				Target.IsBillTo = Source.IsBillTo,
				Target.IsShipTo = Source.IsShipTo,
				Target.IsSoldTo = Source.IsSoldTo,
				Target.DefaultWarehouseId = Source.DefaultWarehouseId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ParentId,
			      CustomerNumber,
			      CustomerSequence,
			      CustomerType,
			      CompanyName,
			      ContactFullName,
			      FirstName,
			      MiddleName,
			      LastName,
			      Phone,
			      Fax,
			      TermsCode,
			      ShipCode,
			      BankCode,
			      TaxCode1,
			      TaxCode2,
			      PriceCode,
			      CurrencyCode,
			      EndUserType,
			      ShipSite,
			      ShipEarly,
			      ShipPartial,
			      Address1,
			      Address2,
			      Address3,
			      Address4,
			      City,
			      State,
			      PostalCode,
			      Country,
			      CreditHold,
			      CreditLimit,
			      Email,
			      Distance,
			      DiscountPercent,
			      SendEmail,
			      LogoImagePath,
			      IsActive,
			      AllowDropShip,
			      DropShipFeeRequired,
			      IsDropShip,
			      StateId,
			      CountryId,
			      IsGuest,
			      ERPNumber,
			      Territory,
			      CustomLandingPage,
			      BudgetEnforcementLevel,
			      CostCodeDescription,
			      DefaultCostCode,
			      IgnoreProductRestrictions,
			      ERPSequence,
			      PricingCustomerId,
			      ModifedOn,
			      CurrencyId,
			      PrimarySalespersonId,
			      IsBillTo,
			      IsShipTo,
			      IsSoldTo,
			      DefaultWarehouseId,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ParentId,
			   Source.CustomerNumber,
			   Source.CustomerSequence,
			   Source.CustomerType,
			   Source.CompanyName,
			   Source.ContactFullName,
			   Source.FirstName,
			   Source.MiddleName,
			   Source.LastName,
			   Source.Phone,
			   Source.Fax,
			   Source.TermsCode,
			   Source.ShipCode,
			   Source.BankCode,
			   Source.TaxCode1,
			   Source.TaxCode2,
			   Source.PriceCode,
			   Source.CurrencyCode,
			   Source.EndUserType,
			   Source.ShipSite,
			   Source.ShipEarly,
			   Source.ShipPartial,
			   Source.Address1,
			   Source.Address2,
			   Source.Address3,
			   Source.Address4,
			   Source.City,
			   Source.State,
			   Source.PostalCode,
			   Source.Country,
			   Source.CreditHold,
			   Source.CreditLimit,
			   Source.Email,
			   Source.Distance,
			   Source.DiscountPercent,
			   Source.SendEmail,
			   Source.LogoImagePath,
			   Source.IsActive,
			   Source.AllowDropShip,
			   Source.DropShipFeeRequired,
			   Source.IsDropShip,
			   Source.StateId,
			   Source.CountryId,
			   Source.IsGuest,
			   Source.ERPNumber,
			   Source.Territory,
			   Source.CustomLandingPage,
			   Source.BudgetEnforcementLevel,
			   Source.CostCodeDescription,
			   Source.DefaultCostCode,
			   Source.IgnoreProductRestrictions,
			   Source.ERPSequence,
			   Source.PricingCustomerId,
			   Source.ModifedOn,
			   Source.CurrencyId,
			   Source.PrimarySalespersonId,
			   Source.IsBillTo,
			   Source.IsShipTo,
			   Source.IsSoldTo,
			   Source.DefaultWarehouseId,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			
			  )
		WHEN NOT MATCHED BY Source THEN
			UPDATE SET IsActive = 0, ModifiedOn = GetDate(), ModifiedBy = @UserName;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END