CREATE PROCEDURE [dbo].[sp_PopulateInsiteCustomer]
(
	
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	sp_PopulateInsiteCustomer
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteCustomer] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

--=================================================================================================================================
--		User Profile Data Merge 
--=================================================================================================================================


		;MERGE [Insite.Morsco]..UserProfile AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..UserProfile AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.FirstName <> Source.FirstName
				OR Target.LastName <> Source.LastName
				OR Target.Company <> Source.Company
				OR Target.Phone <> Source.Phone
				OR Target.Extension <> Source.Extension
				OR Target.Fax <> Source.Fax
				OR Target.Position <> Source.Position
				OR Target.UserName <> Source.UserName
				OR Target.CanChangePassword <> Source.CanChangePassword
				OR Target.CanSubmitOrder <> Source.CanSubmitOrder
				OR Target.CanViewAllOrders <> Source.CanViewAllOrders
				OR Target.IsSubscribed <> Source.IsSubscribed
				OR Target.ApplicationName <> Source.ApplicationName
				OR Target.SubscriptionUser <> Source.SubscriptionUser
				OR Target.IsGuest <> Source.IsGuest
				OR Target.Email <> Source.Email
				OR Target.IsReviewingContent <> Source.IsReviewingContent
				OR ISNULL(Target.DefaultCustomerId,'') <> ISNULL(Source.DefaultCustomerId,'')
				OR ISNULL(Target.ApproverUserProfileId,'') <> ISNULL(Source.ApproverUserProfileId,'')
				OR Target.LimitExceededNotification <> Source.LimitExceededNotification
				OR Target.IsEditingContent <> Source.IsEditingContent
				OR Target.DashboardIsHomepage <> Source.DashboardIsHomepage
				OR ISNULL(Target.CurrencyId,'') <> ISNULL(Source.CurrencyId,'')
				OR Target.IsPasswordChangeRequired <> Source.IsPasswordChangeRequired
				OR ISNULL(Target.HasRfqUpdates,0) <> ISNULL(Source.HasRfqUpdates,0)
				OR ISNULL(Target.LanguageId,'') <> ISNULL(Source.LanguageId,'')
				OR Target.PasswordChangedOn <> Source.PasswordChangedOn
			) THEN
			UPDATE SET 
				Target.FirstName = Source.FirstName,
				Target.LastName = Source.LastName,
				Target.Company = Source.Company,
				Target.Phone = Source.Phone,
				Target.Extension = Source.Extension,
				Target.Fax = Source.Fax,
				Target.Position = Source.Position,
				Target.UserName = Source.UserName,
				Target.CanChangePassword = Source.CanChangePassword,
				Target.CanSubmitOrder = Source.CanSubmitOrder,
				Target.CanViewAllOrders = Source.CanViewAllOrders,
				Target.IsSubscribed = Source.IsSubscribed,
				Target.ApplicationName = Source.ApplicationName,
				Target.SubscriptionUser = Source.SubscriptionUser,
				Target.IsGuest = Source.IsGuest,
				Target.Email = Source.Email,
				Target.IsReviewingContent = Source.IsReviewingContent,
				Target.DefaultCustomerId = Source.DefaultCustomerId,
				Target.ApproverUserProfileId = Source.ApproverUserProfileId,
				Target.LimitExceededNotification = Source.LimitExceededNotification,
				Target.IsEditingContent = Source.IsEditingContent,
				Target.DashboardIsHomepage = Source.DashboardIsHomepage,
				Target.CurrencyId = Source.CurrencyId,
				Target.IsPasswordChangeRequired = Source.IsPasswordChangeRequired,
				Target.HasRfqUpdates = Source.HasRfqUpdates,
				Target.LanguageId = Source.LanguageId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy,
				Target.PasswordChangedOn = Source.PasswordChangedOn
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      FirstName,
			      LastName,
			      Company,
			      Phone,
			      Extension,
			      Fax,
			      Position,
			      UserName,
			      CanChangePassword,
			      CanSubmitOrder,
			      CanViewAllOrders,
			      IsSubscribed,
			      ApplicationName,
			      SubscriptionUser,
			      IsGuest,
			      Email,
			      IsReviewingContent,
			      DefaultCustomerId,
			      ApproverUserProfileId,
			      LimitExceededNotification,
			      IsEditingContent,
			      DashboardIsHomepage,
			      CurrencyId,
			      IsPasswordChangeRequired,
			      HasRfqUpdates,
			      LanguageId,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy,
			      PasswordChangedOn				)
			VALUES
			(
			   Source.Id,
			   Source.FirstName,
			   Source.LastName,
			   Source.Company,
			   Source.Phone,
			   Source.Extension,
			   Source.Fax,
			   Source.Position,
			   Source.UserName,
			   Source.CanChangePassword,
			   Source.CanSubmitOrder,
			   Source.CanViewAllOrders,
			   Source.IsSubscribed,
			   Source.ApplicationName,
			   Source.SubscriptionUser,
			   Source.IsGuest,
			   Source.Email,
			   Source.IsReviewingContent,
			   Source.DefaultCustomerId,
			   Source.ApproverUserProfileId,
			   Source.LimitExceededNotification,
			   Source.IsEditingContent,
			   Source.DashboardIsHomepage,
			   Source.CurrencyId,
			   Source.IsPasswordChangeRequired,
			   Source.HasRfqUpdates,
			   Source.LanguageId,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy,
			   Source.PasswordChangedOn			)
		--WHEN NOT MATCHED BY Source THEN
			--DELETE
			--;

--=================================================================================================================================
--		Sales Person Data Merge 
--=================================================================================================================================
		;MERGE [Insite.Morsco]..SalesPerson AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..SalesPerson AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.SalespersonNumber <> Source.SalespersonNumber
				OR Target.Name <> Source.Name
				OR Target.SalesClass <> Source.SalesClass
				OR Target.Code <> Source.Code
				OR Target.ReferenceNumber <> Source.ReferenceNumber
				OR Target.IsOutsideRep <> Source.IsOutsideRep
				OR Target.SalesPeriodToDate <> Source.SalesPeriodToDate
				OR Target.SalesYearToDate <> Source.SalesYearToDate
				OR Target.Email <> Source.Email
				OR Target.Phone1 <> Source.Phone1
				OR Target.Phone2 <> Source.Phone2
				OR Target.Title <> Source.Title
				OR Target.ParentId <> Source.ParentId
				OR Target.UserProfileId <> Source.UserProfileId
				OR Target.ImagePath <> Source.ImagePath
				OR Target.Description <> Source.Description
				OR Target.MinMarginAllowed <> Source.MinMarginAllowed
				OR Target.MaxDiscountPercent <> Source.MaxDiscountPercent
				OR Target.SalesManagerId <> Source.SalesManagerId
			) THEN
			UPDATE SET 
				Target.SalespersonNumber = Source.SalespersonNumber,
				Target.Name = Source.Name,
				Target.SalesClass = Source.SalesClass,
				Target.Code = Source.Code,
				Target.ReferenceNumber = Source.ReferenceNumber,
				Target.IsOutsideRep = Source.IsOutsideRep,
				Target.SalesPeriodToDate = Source.SalesPeriodToDate,
				Target.SalesYearToDate = Source.SalesYearToDate,
				Target.Email = Source.Email,
				Target.Phone1 = Source.Phone1,
				Target.Phone2 = Source.Phone2,
				Target.Title = Source.Title,
				Target.ParentId = Source.ParentId,
				Target.UserProfileId = Source.UserProfileId,
				Target.ImagePath = Source.ImagePath,
				Target.Description = Source.Description,
				Target.MinMarginAllowed = Source.MinMarginAllowed,
				Target.MaxDiscountPercent = Source.MaxDiscountPercent,
				Target.SalesManagerId = Source.SalesManagerId,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      SalespersonNumber,
			      Name,
			      SalesClass,
			      Code,
			      ReferenceNumber,
			      IsOutsideRep,
			      SalesPeriodToDate,
			      SalesYearToDate,
			      Email,
			      Phone1,
			      Phone2,
			      Title,
			      ParentId,
			      UserProfileId,
			      ImagePath,
			      Description,
			      MinMarginAllowed,
			      MaxDiscountPercent,
			      SalesManagerId,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.SalespersonNumber,
			   Source.Name,
			   Source.SalesClass,
			   Source.Code,
			   Source.ReferenceNumber,
			   Source.IsOutsideRep,
			   Source.SalesPeriodToDate,
			   Source.SalesYearToDate,
			   Source.Email,
			   Source.Phone1,
			   Source.Phone2,
			   Source.Title,
			   Source.ParentId,
			   Source.UserProfileId,
			   Source.ImagePath,
			   Source.Description,
			   Source.MinMarginAllowed,
			   Source.MaxDiscountPercent,
			   Source.SalesManagerId,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		--WHEN NOT MATCHED BY Source THEN
		--	DELETE;

--=================================================================================================================================
--		Customer table MERGE
--=================================================================================================================================
			;MERGE [Insite.Morsco]..Customer AS Target
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


		--=================================================================================================================================
		--		CustomerCarrier table MERGE
		--=================================================================================================================================


		;MERGE [Insite.Morsco]..CustomerCarrier AS Target
		USING
		(
			SELECT * FROM ETL_Ecommerce..CustomerCarrier AS Source
		) AS Source
		ON Target.CustomerId = Source.CustomerId
			AND Target.CarrierId = Source.CarrierId
		WHEN NOT MATCHED BY TARGET THEN
		INSERT 
			(
			    CustomerId,
			    CarrierId				)
		VALUES
		(
			Source.CustomerId,
			Source.CarrierId			);

		--=================================================================================================================================
		--		Merge Customer Property data into Insite DB
		--=================================================================================================================================

		--DECLARE @UserName VARCHAR(50) = 'ServiceUser';
		Exec [dbo].[sp_PopulateInsiteCustomerProperty] 'ShipBranchOverride', @UserName;
		Exec [dbo].[sp_PopulateInsiteCustomerProperty] 'PriceBranchOverride', @UserName;
		Exec [dbo].[sp_PopulateInsiteCustomerProperty] 'IsJobAccount', @UserName;
		
		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;



END