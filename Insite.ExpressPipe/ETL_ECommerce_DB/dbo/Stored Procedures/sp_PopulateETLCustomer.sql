CREATE PROCEDURE [dbo].[sp_PopulateETLCustomer]
(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This Procedure is created to populate the 
--               Customer Data in to the Customer Table 
--				 Morsco.com --> ETL DB --> Insite ExpressPipe DB
-- =============================================
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION
		
--########################################################################################################################################################
--		ADD CUSTOMER RECOREDS FOR BILL TO CUSTOMER
--########################################################################################################################################################
			TRUNCATE TABLE Customer;

			;WIth CustomerConsolidatedRecords As
			( 		
					SELECT 
						C.ETLSourceId
						,NEWID()			[Id]  -- New CustomerID
						,NULL				[ParentId]
						,C.[CustomerNo]		[CustomerNumber]
						,''					[CustomerSequence]
						,[CustomerGroup]	[CustomerType]
						,[CustomerName]		[CompanyName]
						,''					[ContactFullName]
						,''					[FirstName]
						,''					[MiddleName]
						,''					[LastName]
						,[PhoneNo]			[Phone]
						,[FaxNo]			[Fax]
						,[TermsCode]		[TermsCode]
						,[ShipViaCode]		[ShipCode]
						,''					[BankCode]
						,''					[TaxCode1]
						,''					[TaxCode2]
						,''					[PriceCode]
						,'USD'				[CurrencyCode]
						,''					[EndUserType]
						,''					[ShipSite]
						,1					[ShipEarly]
						,1					[ShipPartial]
						,[AddressLine1]		[Address1]
						,[AddressLine2]		[Address2]
						,''					[Address3]
						,''					[Address4]
						,[City]				[City]
						,[State]			[State]
						,[Zip]				[PostalCode]
						,'USA'				[Country]
						,ISNULL(NULLIF(CreditHold, 'NULL'),0)
											[CreditHold]
						,CreditLimit		[CreditLimit]
						,[Email]			[Email]
						,0					[Distance]
						,0					[DiscountPercent]
						,1					[SendEmail]
						,''					[LogoImagePath]
						,1					[IsActive]
						,0					[AllowDropShip]
						,0					[DropShipFeeRequired]
						,0					[IsDropShip]
						,NULL				[StateId]	--TODO
						,NULL				[CountryId] --TODO
						,0					[IsGuest]
						,[CustomerNo]		[ERPNumber]
						,[Territory]		[Territory]
						,''					[CustomLandingPage]
						,'10000'				[BudgetEnforcementLevel]
						,''					[CostCodeDescription]
						,''					[DefaultCostCode]
						,0					[IgnoreProductRestrictions]
						,''					[ERPSequence]
						,null				[PricingCustomerId]
						,GETDATE()			[ModifedOn]
						,NULL				[CurrencyId]	--TODO
						,NULL				[PrimarySalespersonId]  --TODO
						,IsBillTo			[IsBillTo]
						,IsShipTo			[IsShipTo]
						,0					[IsSoldTo]
						,NULL				[DefaultWarehouseId]
						,GETDATE()			[CreatedOn]
						,''					[CreatedBy]--@UserName			[CreatedBy]
						,GETDATE()			[ModifiedOn]
						,''					[ModifiedBy]--@UserName			[ModifiedBy]
					FROM [vw_BillToCustomersData] C
					UNION
					SELECT 
						C.ETLSourceId
						,NEWID()			[Id]  -- New CustomerID
						,NULL				[ParentId]
						,C.[BillToCustomerID]					--??? What if customer number is null???
											[CustomerNumber]	-- BillToCustomerId is customer number for the ship to customer records
						,C.[CustomerNo]		[CustomerSequence]	--For ShipTOCustomer.. this field holds the actual customer number
						,[CustomerGroup]	[CustomerType]
						,[CustomerName]		[CompanyName]
						,''					[ContactFullName]
						,''					[FirstName]
						,''					[MiddleName]
						,''					[LastName]
						,[PhoneNo]			[Phone]
						,[FaxNo]			[Fax]
						,[TermsCode]		[TermsCode]
						,[ShipViaCode]		[ShipCode]
						,''					[BankCode]
						,''					[TaxCode1]
						,''					[TaxCode2]
						,''					[PriceCode]
						,'USD'				[CurrencyCode]
						,''					[EndUserType]
						,''					[ShipSite]
						,1					[ShipEarly]
						,1					[ShipPartial]
						,[AddressLine1]		[Address1]
						,[AddressLine2]		[Address2]
						,''					[Address3]
						,''					[Address4]
						,[City]				[City]
						,[State]			[State]
						,[Zip]				[PostalCode]
						,'USA'				[Country]
						,ISNULL(NULLIF(CreditHold, 'NULL'),0)
											[CreditHold]
						,CreditLimit		[CreditLimit]
						,[Email]			[Email]
						,0					[Distance]
						,0					[DiscountPercent]
						,1					[SendEmail]
						,''					[LogoImagePath]
						,1					[IsActive]
						,0					[AllowDropShip]
						,0					[DropShipFeeRequired]
						,0					[IsDropShip]
						,NULL				[StateId]	--TODO
						,NULL				[CountryId] --TODO
						,0					[IsGuest]
						,[CustomerNo]		[ERPNumber]
						,[Territory]		[Territory]
						,''					[CustomLandingPage]
						,'10000'				[BudgetEnforcementLevel]
						,''					[CostCodeDescription]
						,''					[DefaultCostCode]
						,0					[IgnoreProductRestrictions]
						,''					[ERPSequence]
						,null				[PricingCustomerId]
						,GETDATE()			[ModifedOn]
						,NULL				[CurrencyId]	--TODO
						,NULL				[PrimarySalespersonId]  --TODO
						,IsBillTo			[IsBillTo]
						,IsShipTo			[IsShipTo]
						,0					[IsSoldTo]
						,NULL				[DefaultWarehouseId]
						,GETDATE()			[CreatedOn]
						,''					[CreatedBy]--@UserName			[CreatedBy]
						,GETDATE()			[ModifiedOn]
						,''					[ModifiedBy]--@UserName			[ModifiedBy]
					FROM [vw_ShipToCustomersData] C
			),
			CustomerDuplicates as
			(
				 SELECT ROW_NUMBER() OVER (PARTITION BY [CustomerNumber], [CustomerSequence],[IsBillTo],[IsShipTo]  
						ORDER BY [CustomerNumber], [CustomerSequence],[IsBillTo],[IsShipTo] DESC) DuplicateRowNum,
						* 
				  FROM CustomerConsolidatedRecords
			)

			INSERT INTO [dbo].[Customer]
					   ([ETLSourceId]
					   ,[Id]
					   ,[ParentId]
					   ,[CustomerNumber]
					   ,[CustomerSequence]
					   ,[CustomerType]
					   ,[CompanyName]
					   ,[ContactFullName]
					   ,[FirstName]
					   ,[MiddleName]
					   ,[LastName]
					   ,[Phone]
					   ,[Fax]
					   ,[TermsCode]
					   ,[ShipCode]
					   ,[BankCode]
					   ,[TaxCode1]
					   ,[TaxCode2]
					   ,[PriceCode]
					   ,[CurrencyCode]
					   ,[EndUserType]
					   ,[ShipSite]
					   ,[ShipEarly]
					   ,[ShipPartial]
					   ,[Address1]
					   ,[Address2]
					   ,[Address3]
					   ,[Address4]
					   ,[City]
					   ,[State]
					   ,[PostalCode]
					   ,[Country]
					   ,[CreditHold]
					   ,[CreditLimit]
					   ,[Email]
					   ,[Distance]
					   ,[DiscountPercent]
					   ,[SendEmail]
					   ,[LogoImagePath]
					   ,[IsActive]
					   ,[AllowDropShip]
					   ,[DropShipFeeRequired]
					   ,[IsDropShip]
					   ,[StateId]
					   ,[CountryId]
					   ,[IsGuest]
					   ,[ERPNumber]
					   ,[Territory]
					   ,[CustomLandingPage]
					   ,[BudgetEnforcementLevel]
					   ,[CostCodeDescription]
					   ,[DefaultCostCode]
					   ,[IgnoreProductRestrictions]
					   ,[ERPSequence]
					   ,[PricingCustomerId]
					   ,[ModifedOn]
					   ,[CurrencyId]
					   ,[PrimarySalespersonId]
					   ,[IsBillTo]
					   ,[IsShipTo]
					   ,[IsSoldTo]
					   ,[DefaultWarehouseId]
					   ,[CreatedOn]
					   ,[CreatedBy]
					   ,[ModifiedOn]
					   ,[ModifiedBy])
				 Select 
					   ETLSourceId
					  ,[Id]
					  ,[ParentId]
					  ,[CustomerNumber]
					  ,[CustomerSequence]
					  ,[CustomerType]
					  ,[CompanyName]
					  ,[ContactFullName]
					  ,[FirstName]
					  ,[MiddleName]
					  ,[LastName]
					  ,[Phone]
					  ,[Fax]
					  ,[TermsCode]
					  ,[ShipCode]
					  ,[BankCode]
					  ,[TaxCode1]
					  ,[TaxCode2]
					  ,[PriceCode]
					  ,[CurrencyCode]
					  ,[EndUserType]
					  ,[ShipSite]
					  ,[ShipEarly]
					  ,[ShipPartial]
					  ,[Address1]
					  ,[Address2]
					  ,[Address3]
					  ,[Address4]
					  ,[City]
					  ,[State]
					  ,[PostalCode]
					  ,[Country]
					  ,[CreditHold]
					  ,[CreditLimit]
					  ,[Email]
					  ,[Distance]
					  ,[DiscountPercent]
					  ,[SendEmail]
					  ,[LogoImagePath]
					  ,[IsActive]
					  ,[AllowDropShip]
					  ,[DropShipFeeRequired]
					  ,[IsDropShip]
					  ,[StateId]
					  ,[CountryId]
					  ,[IsGuest]
					  ,[ERPNumber]
					  ,[Territory]
					  ,[CustomLandingPage]
					  ,[BudgetEnforcementLevel]
					  ,[CostCodeDescription]
					  ,[DefaultCostCode]
					  ,[IgnoreProductRestrictions]
					  ,[ERPSequence]
					  ,[PricingCustomerId]
					  ,[ModifedOn]
					  ,[CurrencyId]
					  ,[PrimarySalespersonId]
					  ,[IsBillTo]
					  ,[IsShipTo]
					  ,[IsSoldTo]
					  ,[DefaultWarehouseId]
					  ,[CreatedOn]
					  ,[CreatedBy]
					  ,[ModifiedOn]
					  ,[ModifiedBy]
				  FROM CustomerDuplicates
				 WHERE DuplicateRowNum = 1 
 

		COMMIT TRANSACTION
	END TRY
	BEGIN CATCH
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END CATCH;

END