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
	DECLARE @CurrencyId UNIQUEIDENTIFIER = (SELECT Id FROM [Insite.Morsco].dbo.Currency C WHERE C.CurrencyCode = 'USD')
	DECLARE @CountryID UNIQUEIDENTIFIER = (SELECT Id FROM [Insite.Morsco].dbo.Country C WHERE C.ISOCode3 = 'USA')
	DECLARE @SalesPerson TABLE(SalesPersonID VARCHAR(20));
	DECLARE @EmptyUniqueIdentifier UNIQUEIDENTIFIER = (SELECT CAST(CAST(0 AS BINARY) AS UNIQUEIDENTIFIER)) 
	DECLARE @TempSalesPerson TABLE ([Territory] [varchar](10) NULL,
		[SalesPersonID] [varchar](20) NOT NULL,
		[SalesPersonName] [varchar](30) NULL,
		[Branch] [varchar](10) NULL,
		[EMail] [varchar](200) NULL,
		[Phone1] [varchar](50) NULL) 

		-- Assumptions: States, countries and currencies already exist.
		TRUNCATE TABLE Customer;
		DELETE SalesPerson
		DELETE UserProfile
	
		--********************************************************************************************************************
		-- Currently have to create salespeople for all customers.  We have info
		-- for a subset of that in DM_Ecommerce
		--********************************************************************************************************************
	
		
		INSERT @Salesperson(SalespersonID)
		SELECT SalesPersonId
		FROM DM_ECommerce.dbo.SalesPerson (NOLOCK)
		WHERE ETLSourceID = @EtlSourceId AND ISNULL(No_logon,'0') = 1


		;WITH DuplicateSalesPerson AS
			(
				SELECT ROW_NUMBER() OVER (PARTITION BY SalesPersonId order by SalesPersonID) as DupRow
				, SP.*,B.PhoneNumber
				FROM DM_ECommerce.dbo.SalesPerson SP (NOLOCK)
				LEFT OUTER JOIN DM_ECommerce..Branch B (NOLOCK) ON B.BranchID = SP.Branch
				WHERE SP.ETLSourceID = @EtlSourceId
			)
				INSERT @TempSalesperson([Territory],[SalesPersonID],[SalesPersonName],[Branch],[EMail],[Phone1])
				SELECT [Territory], [SalesPersonID],[SalesPersonName],[Branch],[EMail],PhoneNumber 
				  FROM DuplicateSalesPerson
			     WHERE DupRow = 1;
		 
			
		--********************************************************************************************************************
		-- Add user profile for salespeople
		--********************************************************************************************************************
		INSERT INTO [dbo].[UserProfile]
		(
			[Id]
			,[FirstName]
			,[LastName]
			,[Company]
			,[Phone]
			,[Extension]
			,[Fax]
			,[Position]
			,[UserName]
			,[CanChangePassword]
			,[CanSubmitOrder]
			,[CanViewAllOrders]
			,[IsSubscribed]
			,[ApplicationName]
			,[SubscriptionUser]
			,[IsGuest]
			,[Email]
			,[IsReviewingContent]
			,[DefaultCustomerId]
			,[ApproverUserProfileId]
			,[LimitExceededNotification]
			,[IsEditingContent]
			,[DashboardIsHomepage]
			,[CurrencyId]
			,[IsPasswordChangeRequired]
			,[HasRfqUpdates]
			,[LanguageId]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy]
			,[PasswordChangedOn])
		SELECT DISTINCT
			ISNULL(UP.ID, NEWID()) [Id],
			ISNULL(UP.FirstName, '') [FirstName],
			-- Can't really divide up names properly
			COALESCE(UP.LastName, SP2.SalesPersonName, SP.SalespersonId) [LastName],
			ISNULL(UP.Company, '') [Company],
			ISNULL(UP.Phone, '') [Phone],
			ISNULL(UP.Extension,'') [Extension],
			ISNULL(UP.Fax,'') [Fax],
			ISNULL(UP.Position, '') [Position],
			-- This is the join field
			SP.SalespersonId [UserName],
			ISNULL(UP.CanChangePassword, 1) [CanChangePassword],
			ISNULL(UP.CanSubmitOrder, 1) [CanSubmitOrder],
			ISNULL(UP.CanViewAllOrders, 1) [CanViewAllOrders],
			ISNULL(UP.IsSubscribed, 0) [IsSubscribed],
			ISNULL(UP.ApplicationName, '/') [ApplicationName],
			ISNULL(UP.SubscriptionUser, 0) [SubscriptionUser],
			ISNULL(UP.IsGuest, 0) [IsGuest],
			ISNULL(UP.Email, '') [Email],
			ISNULL(UP.IsReviewingContent, 0) [IsReviewingContent],
			ISNULL(UP.DefaultCustomerId, NULL) [DefaultCustomerId],
			ISNULL(UP.ApproverUserProfileId, NULL) [ApproverUserProfileId],
			ISNULL(UP.LimitExceededNotification, 0) [LimitExceededNotification],
			ISNULL(UP.IsEditingContent, 0) [IsEditingContent],
			ISNULL(UP.DashboardIsHomePage, 0) [DashboardIsHomepage],
			ISNULL(UP.CurrencyId, @CurrencyID) [CurrencyId],
			ISNULL(UP.[IsPasswordChangeRequired], 1) [IsPasswordChangeRequired],
			ISNULL(UP.HasRfqUpdates, 0) [HasRfqUpdates],
			ISNULL(UP.LanguageId, NULL) [LanguageId],
			ISNULL(UP.CreatedOn, GETDATE()) [CreatedOn],
			ISNULL(UP.CreatedBy, @UserName) [CreatedBy],
			ISNULL(UP.ModifiedOn, GETDATE()) [ModifiedOn],
			ISNULL(UP.ModifiedBy, @UserName) [ModifiedBy],
			ISNULL(UP.PasswordChangedOn, GETDATE()) [PasswordChangedOn]
		FROM @SalesPerson SP
		LEFT JOIN @TempSalesperson SP2 ON SP2.SalesPersonID = SP.SalesPersonId
		-- There is a lot of stuff that might change in userprofile, so join and update at the outset
		LEFT JOIN [Insite.Morsco].dbo.UserProfile UP (NOLOCK) ON UP.UserName = SP.SalespersonId


		--********************************************************************************************************************
				/* Check for existing IDs*/
				UPDATE EUP 
				   SET EUP.ID = IUP.ID
				  FROM UserProfile EUP (NOLOCK)
			INNER JOIN [Insite.Morsco]..UserProfile IUP 
					ON EUP.UserName = IUP.UserName AND EUP.ApplicationName = IUP.ApplicationName
		--********************************************************************************************************************

		--********************************************************************************************************************
		-- Add user profile for salespeople
		--********************************************************************************************************************
		;WITH SP AS
		(
			SELECT DISTINCT ISNULL(Salesperson, '') SalesPerson
			FROM [DM_ECommerce].dbo.Customer (NOLOCK)
			WHERE ETLSourceID = @ETLSourceID
			AND ISNULL(Salesperson, '') <> ''
		)
		INSERT INTO [dbo].[Salesperson]
			([Id]
			,[SalespersonNumber]
			,[Name]
			,[SalesClass]
			,[Code]
			,[ReferenceNumber]
			,[IsOutsideRep]
			,[SalesPeriodToDate]
			,[SalesYearToDate]
			,[Email]
			,[Phone1]
			,[Phone2]
			,[Title]
			,[ParentId]
			,[UserProfileId]
			,[ImagePath]
			,[Description]
			,[MinMarginAllowed]
			,[MaxDiscountPercent]
			,[SalesManagerId]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy])
			SELECT DISTINCT
			ISNULL(S.Id, NEWID()) Id,
			SP.SalesPersonId SalespersonNumber,				-- This is what we're joining on
			ISNULL(S.Name, SP.SalesPersonId)  Name,
			ISNULL(S.SalesClass, '') SalesClass,
			ISNULL(S.Code, '') Code,
			ISNULL(S.ReferenceNumber, '') ReferenceNumber,
			ISNULL(S.IsOutsideRep, 0) IsOutsideSalesRep,
			ISNULL(S.SalesPeriodToDate, 0) SalesPeriodToDate,
			ISNULL(S.SalesYearToDate, 0) SalesYearToDate,
			ISNULL(S.Email, '') Email,
			ISNULL(SP2.Phone1, ISNULL(S.Phone1,'')) Phone1,
			ISNULL(S.Phone2, '') Phone2,
			ISNULL(S.Title, '') Title,
			ISNULL(S.ParentId, NULL) ParentId,
			UP.Id UserProfileId,
			ISNULL(S.ImagePath, '') ImagePath,
			ISNULL(S.Description, '') Description,
			ISNULL(S.MinMarginAllowed, 0) MinMarginAllowed,
			ISNULL(S.MaxDiscountPercent, 0) MaxDiscountPercent,
			ISNULL(S.SalesManagerId, NULL) SalesManagerId,
			ISNULL(UP.CreatedOn, GETDATE()) [CreatedOn],
			ISNULL(UP.CreatedBy, @UserName) [CreatedBy],
			ISNULL(UP.ModifiedOn, GETDATE()) [ModifiedOn],
			ISNULL(UP.ModifiedBy, @UserName) [ModifiedBy]
		FROM @SalesPerson SP
		LEFT JOIN @TempSalesperson SP2 ON SP2.SalesPersonID = SP.SalesPersonId
		JOIN UserProfile UP /* not Insite.UserProfile */
						ON UP.UserName = SP.SalesPersonId
		LEFT JOIN SalesPerson S ON S.SalespersonNumber = SP.SalesPersonId

		--********************************************************************************************************************
		/* Check for existing IDs*/
		UPDATE ESP 
		   SET ESP.ID = ISP.ID
		  FROM SalesPerson ESP (NOLOCK)
	INNER JOIN [Insite.Morsco]..SalesPerson ISP (NOLOCK)
	        ON ESP.SalesPersonNumber = ISP.SalesPersonNumber
		--********************************************************************************************************************

		--********************************************************************************************************************
		-- Add Bill-to-Customers
		--********************************************************************************************************************

		;WITH Unique_BillToCustomer AS
		(
			SELECT ROW_NUMBER() OVER(PARTITION BY CustomerNo, BillToCustomerId Order By CustomerNo) AS DUPROW
				, *
				FROM [dbo].[vw_QualifyingCustomers] C
				WHERE C.IsBillTo = 1 
				AND C.ETLSourceId = @EtlSourceId
		)

		INSERT INTO [dbo].[Customer]
			([Id]
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
		SELECT 
			ISNULL(C2.ID, NEWID())					[Id],
			ISNULL(C2.ParentId,NULL)				[ParentId],
			C.[CustomerNo]							[CustomerNumber],
			ISNULL(C2.CustomerSequence ,'')			[CustomerSequence],
			ISNULL(C.CustomerGroup, '')				[CustomerType],
			[dbo].[fn_ScrubData2](ISNULL(C.[CustomerName],''))				[CompanyName],
			ISNULL(C2.ContactFullName, '')			[ContactFullName],
			ISNULL(C2.FirstName, '')				[FirstName],
			ISNULL(C2.MiddleName, '')				[MiddleName],
			ISNULL(C2.LastName, '')					[LastName],
			ISNULL(C.[PhoneNo],'')					[Phone],
			ISNULL(C.[FaxNo],'')					[Fax],
			ISNULL(C.[TermsCode],'')					[TermsCode], 
			ISNULL(NULLIF(C.[ShipViaCode],'NULL'),'') [ShipCode],
			ISNULL(C2.BankCode, '')					[BankCode],
			ISNULL(C2.TaxCode1, '')					[TaxCode1],
			ISNULL(C2.TaxCode1, '')					[TaxCode2],
			ISNULL(C2.PriceCode, '')				[PriceCode],
			'USD'									[CurrencyCode],
			ISNULL(C2.EndUserType, '')				[EndUserType],
			ISNULL(C2.ShipSite, '')					[ShipSite],           --TODO: Open question about Branch
			ISNULL(C2.ShipEarly, 1)					[ShipEarly],
			ISNULL(C2.ShipPartial, 1)				[ShipPartial],
			[dbo].[fn_ScrubData](ISNULL(C.[AddressLine1],''))				[Address1],
			[dbo].[fn_ScrubData](ISNULL(C.[AddressLine2],''))				[Address2],
			ISNULL(C2.Address3, '')					[Address3],
			ISNULL(C2.Address4, '')					[Address4],
			ISNULL(C.[City], '')					[City],
			ISNULL(C.[State], '')					[State],
			ISNULL(C.[Zip], '')						[PostalCode],
			ISNULL(C2.Country, 'USA')				[Country],
			COALESCE(C2.CreditHold, NULLIF(C.CreditHold, 'NULL'), 0) [CreditHold],
			ISNULL(C.CreditLimit, 0)				[CreditLimit],
			ISNULL(C.[Email], '')					[Email],
			ISNULL(C2.Distance, 0)					[Distance],
			ISNULL(C2.DiscountPercent, 0)			[DiscountPercent],
			ISNULL(C2.SendEmail, 1)					[SendEmail],
			ISNULL(C2.LogoImagePath, '')			[LogoImagePath],
			ISNULL(C2.IsActive, 1)					[IsActive],
			ISNULL(C2.AllowDropShip, 0)				[AllowDropShip],
			ISNULL(C2.DropShipFeeRequired, 0)		[DropShipFeeRequired],
			ISNULL(C2.IsDropShip, 0)				[IsDropShip],
			S.ID									[StateId],
			@CountryId								[CountryId],
			ISNULL(C2.IsGuest, 0)					[IsGuest],
			C.[CustomerNo]							[ERPNumber],
			ISNULL(C.[Territory], '')				[Territory],
			ISNULL(C2.CustomLandingPage, '')		[CustomLandingPage],
			ISNULL(C2.BudgetEnforcementLevel, '10000')	[BudgetEnforcementLevel],
			ISNULL(C2.CostCodeDescription, '')		[CostCodeDescription],
			ISNULL(C2.DefaultCostCode, '')			[DefaultCostCode],
			ISNULL(C2.IgnoreProductRestrictions, 0)	[IgnoreProductRestrictions],
			ISNULL(C2.ErpSequence, '')				[ERPSequence],
			ISNULL(C2.PricingCustomerId, null)		[PricingCustomerId],
			ISNULL(C2.ModifedOn, GETDATE())			[ModifedOn],
			ISNULL(C2.CurrencyId, @CurrencyId)		[CurrencyId],
			ISNULL(C2.PrimarySalesPersonId, SP.ID)	[PrimarySalespersonId],
			C.IsBillTo								[IsBillTo],
			C.IsShipTo								[IsShipTo],
			ISNULL(C2.IsSoldTo, 0)					[IsSoldTo],
			ISNULL(C2.DefaultWarehouseId, NULL)		[DefaultWarehouseId],
			ISNULL(C2.CreatedOn, GETDATE())			[CreatedOn],
			ISNULL(C2.CreatedBy, @UserName)			[CreatedBy],
			ISNULL(C2.ModifiedOn, GETDATE())		[ModifiedOn],
			ISNULL(C2.ModifiedBy, @UserName)		[ModifiedBy]
		FROM Unique_BillToCustomer C
		LEFT JOIN [Insite.Morsco].dbo.Customer C2 (NOLOCK) ON C2.CustomerNumber = C.CustomerNo
			                                                    AND C2.CustomerSequence IS NULL
		LEFT JOIN [Insite.Morsco].dbo.State S (NOLOCK) ON S.Abbreviation = C.State OR S.Name = C.State
		LEFT JOIN SalesPerson SP (NOLOCK) ON SP.SalesPersonNumber = C.Salesperson
		WHERE C.DUPROW = 1

		--********************************************************************************************************************
		-- Add SHIP-to-Customers
		--********************************************************************************************************************
		;WITH Unique_ShipToCustomer AS
		(
			SELECT ROW_NUMBER() OVER(PARTITION BY BillToCustomerId , CustomerNo Order By BillToCustomerId, CustomerNo) AS DUPROW
				, *
				FROM [dbo].[vw_QualifyingCustomers] C
				WHERE C.IsBillTo = 0 AND C.ETLSourceId = @EtlSourceId
		),
		Unique_BillToCustomer AS
		(
			SELECT ROW_NUMBER() OVER(PARTITION BY CustomerNo, BillToCustomerId Order By CustomerNo) AS DUPROW
				, *
				FROM [dbo].[vw_QualifyingCustomers] C
				WHERE C.IsBillTo = 1 
				AND C.ETLSourceId = @EtlSourceId
		)

		INSERT INTO [dbo].[Customer]
			([Id]
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
		SELECT  
			ISNULL(C2.ID, NEWID())					[Id],
			NULL									[ParentId],                        
			C.[BillToCustomerId]					[CustomerNumber],		-- Use the customerno for the parent
			C.[CustomerNo]							[CustomerSequence],		-- Use this row's customerno
			ISNULL(C.CustomerGroup, '')				[CustomerType],
			[dbo].[fn_ScrubData](ISNULL(C.[CustomerName],''))				[CompanyName],
			ISNULL(C2.ContactFullName, '')			[ContactFullName],
			ISNULL(C2.FirstName, '')				[FirstName],
			ISNULL(C2.MiddleName, '')				[MiddleName],
			ISNULL(C2.LastName, '')					[LastName],
			COALESCE(C.[PhoneNo],BT.[PhoneNo],'')					[Phone],
			COALESCE(C.[FaxNo],BT.[FaxNo],'')					[Fax],
			ISNULL(C.[TermsCode],'')				[TermsCode],
			ISNULL(NULLIF(C.[ShipViaCode],'NULL'),'') [ShipCode],
			ISNULL(C2.BankCode, '')					[BankCode],
			ISNULL(C2.TaxCode1, '')					[TaxCode1],
			ISNULL(C2.TaxCode1, '')					[TaxCode2],
			ISNULL(C2.PriceCode, '')				[PriceCode],
			'USD'									[CurrencyCode],
			ISNULL(C2.EndUserType, '')				[EndUserType],
			ISNULL(C2.ShipSite, '')					[ShipSite],           --TODO: Open question about Branch
			ISNULL(C2.ShipEarly, 1)					[ShipEarly],
			ISNULL(C2.ShipPartial, 1)				[ShipPartial],
			[dbo].[fn_ScrubData](ISNULL(C.[AddressLine1],''))				[Address1],
			[dbo].[fn_ScrubData](ISNULL(C.[AddressLine2],''))				[Address2],
			ISNULL(C2.Address3, '')					[Address3],
			ISNULL(C2.Address4, '')					[Address4],
			ISNULL(C.[City], '')					[City],
			ISNULL(C.[State], '')					[State],
			ISNULL(C.[Zip], '')						[PostalCode],
			ISNULL(C2.Country, 'USA')				[Country],
			COALESCE(C2.CreditHold, NULLIF(C.CreditHold, 'NULL'), 0) [CreditHold],
			ISNULL(C.CreditLimit, 0)				[CreditLimit],
			ISNULL(C.[Email], '')					[Email],
			ISNULL(C2.Distance, 0)					[Distance],
			ISNULL(C2.DiscountPercent, 0)			[DiscountPercent],
			ISNULL(C2.SendEmail, 1)					[SendEmail],
			ISNULL(C2.LogoImagePath, '')			[LogoImagePath],
			ISNULL(C2.IsActive, 1)					[IsActive],
			ISNULL(C2.AllowDropShip, 0)				[AllowDropShip],
			ISNULL(C2.DropShipFeeRequired, 0)		[DropShipFeeRequired],
			ISNULL(C2.IsDropShip, 0)				[IsDropShip],
			S.ID									[StateId],
			@CountryId								[CountryId],
			ISNULL(C2.IsGuest, 0)					[IsGuest],
			C.[CustomerNo]							[ERPNumber],
			ISNULL(C.[Territory], '')				[Territory],
			ISNULL(C2.CustomLandingPage, '')		[CustomLandingPage],
			ISNULL(C2.BudgetEnforcementLevel, '10000')	[BudgetEnforcementLevel],
			ISNULL(C2.CostCodeDescription, '')		[CostCodeDescription],
			ISNULL(C2.DefaultCostCode, '')			[DefaultCostCode],
			ISNULL(C2.IgnoreProductRestrictions, 0)	[IgnoreProductRestrictions],
			ISNULL(C2.ErpSequence, '')				[ERPSequence],
			ISNULL(C2.PricingCustomerId, null)		[PricingCustomerId],
			ISNULL(C2.ModifedOn, GETDATE())			[ModifedOn],
			ISNULL(C2.CurrencyId, @CurrencyId)		[CurrencyId],
			ISNULL(C2.PrimarySalesPersonId, SP.ID)	[PrimarySalespersonId],
			C.IsBillTo								[IsBillTo],
			C.IsShipTo								[IsShipTo],
			ISNULL(C2.IsSoldTo, 0)					[IsSoldTo],
			ISNULL(C2.DefaultWarehouseId, NULL)		[DefaultWarehouseId],
			ISNULL(C2.CreatedOn, GETDATE())			[CreatedOn],
			ISNULL(C2.CreatedBy, @UserName)			[CreatedBy],
			ISNULL(C2.ModifiedOn, GETDATE())		[ModifiedOn],
			ISNULL(C2.ModifiedBy, @UserName)		[ModifiedBy]
		FROM Unique_ShipToCustomer C 
		join Unique_BillToCustomer BT ON BT.CustomerNo = C.BillToCustomerID
		LEFT JOIN [Insite.Morsco].dbo.Customer C2 (NOLOCK) ON C2.CustomerNumber = C.BillToCustomerID  
																	AND C2.CustomerSequence = C.CustomerNo
		LEFT JOIN [Insite.Morsco].dbo.State S (NOLOCK) ON S.Abbreviation = C.State OR S.Name = C.State
		LEFT JOIN Salesperson SP (NOLOCK) ON SP.SalesPersonNumber = C.Salesperson
		WHERE C.DUPROW = 1 AND BT.DUPROW = 1
		-- Don't create job acct if it's the same as the parent
		
		--********************************************************************************************************************
		--Update Default warehouse details to the customer table
		--********************************************************************************************************************
			;WITH CTE AS
			(
				SELECT 
					CASE 
						WHEN C.IsBillTo = 1 THEN C.CustomerNo 
						ELSE C.BillToCustomerID 
					END CustomerNumber,
					CASE 
						WHEN C.IsBillTo = 1 THEN '' 
						ELSE C.CustomerNo 
					END CustomerSequence,
					C.HomeBranchID
				FROM DM_Ecommerce..Customer C (NOLOCK)
				WHERE C.EtlSourceID = @ETLSourceID
			),
			DefaultWarehouse AS
			(
				SELECT ID FROM ETL_ECommerce..Warehouse (NOLOCK) WHERE ShipSite = 12
			)
			UPDATE C
			SET DefaultWarehouseId = ISNULL(w.id, dw.id)
			FROM ETL_Ecommerce..Customer C 
			LEFT JOIN CTE ON CTE.CustomerNumber = C.CustomerNumber 
				          AND CTE.CustomerSequence = C.CustomerSequence
			LEFT JOIN ETL_Ecommerce..Warehouse W ON W.ShipSite = CTE.HomeBranchID
			CROSS JOIN DefaultWarehouse DW
			WHERE C.DefaultWarehouseId IS NULL 

		--******************************************************************************************************************

		--********************************************************************************************************************
		/* Check for existing IDs*/
			UPDATE EC
			   SET EC.ID = IC.ID
			  FROM Customer EC
		INNER JOIN [Insite.Morsco].[dbo].[Customer] IC 
		        ON EC.[CustomerNumber] = IC.[CustomerNumber] 
			   AND EC.[CustomerSequence] = IC.[CustomerSequence]
		--********************************************************************************************************************

		--********************************************************************************************************************
		--Assign default carriers (Will Call & Ship My Items) to all customers
		--********************************************************************************************************************
			UPDATE ECR SET ID = ICR.ID 
			FROM Carrier ECR (NOLOCK)
			JOIN [Insite.Morsco]..Carrier ICR (NOLOCK) ON ECR.Name = ICR.Name

			DECLARE @WillCall UNIQUEIDENTIFIER = (Select ID FROM Carrier WHERE Name = 'Will Call');
			DECLARE @ShipMyItems UNIQUEIDENTIFIER = (Select ID FROM Carrier WHERE Name = 'Ship Items');

			TRUNCATE TABLE [dbo].[CustomerCarrier]

			-- Assigning Will Call Carrier to the Customers
			INSERT CustomerCarrier 
			(CustomerId, 
			CarrierId)
			SELECT ID CustomerId, @WillCall CarrierId 
			FROM Customer 
			WHERE ID NOT IN (SELECT DISTINCT CustomerId 
							FROM [Insite.Morsco]..CustomerCarrier (NOLOCK)
							WHERE CarrierId = @WillCall)
			
			-- Assigning Ship My Items Carrier to the Customers
			INSERT CustomerCarrier 
			(CustomerId, 
			CarrierId)
			SELECT ID CustomerId, @ShipMyItems CarrierId 
			FROM Customer (NOLOCK)
			WHERE ID NOT IN (SELECT DISTINCT CustomerId 
							FROM [Insite.Morsco]..CustomerCarrier 
							WHERE CarrierId = @ShipMyItems)

			--*******************************************************************************************************************
			-- Creating custom properties for the ShipBranchOverride field 
			--*******************************************************************************************************************
			--TRUNCATE THE EXISTING RECORDS FOR Customer ShipBranchOverride CUSTOMER PROPERTY
		
				DELETE FROM [dbo].[CustomerProperty]
				WHERE Name = 'ShipBranchOverride';

				;WITH CTE AS
					(
						SELECT 
							CASE 
								WHEN C.IsBillTo = 1 THEN C.CustomerNo 
								ELSE C.BillToCustomerID 
							END CustomerNumber,
							CASE 
								WHEN C.IsBillTo = 1 THEN '' 
								ELSE C.CustomerNo 
							END CustomerSequence,
							C.ShipBranchOverride,
							C.PriceBranchOverride
						FROM DM_Ecommerce..Customer C (NOLOCK)
						WHERE C.EtlSourceID = @ETLSourceID
					)
				INSERT INTO [dbo].[CustomerProperty]
							([Id]
							,[CustomerId]
							,[Name]
							,[Value]
							,[CreatedOn]
							,[CreatedBy]
							,[ModifiedOn]
							,[ModifiedBy])
				SELECT 
					NEWID() Id
					, C.Id [CustomerId]
					, 'ShipBranchOverride' Name
					,ShipBranchOverride Value
					, GetDate() CreatedOn
					, @UserName CreatedBy
					, GetDate() ModifiedOn
					, @UserName ModifiedBy
				FROM ETL_Ecommerce..Customer C 
				JOIN CTE ON CTE.CustomerNumber = C.CustomerNumber 
								AND CTE.CustomerSequence = C.CustomerSequence
				WHERE CTE.ShipBranchOverride IS NOT NULL;

			--*******************************************************************************************************************
			-- Creating custom properties for the PriceBranchOverride field 
			--*******************************************************************************************************************
			--TRUNCATE THE EXISTING RECORDS FOR Customer PriceBranchOverride CUSTOMER PROPERTY
				DELETE FROM [dbo].[CustomerProperty]
				WHERE Name = 'PriceBranchOverride';

				;WITH CTE AS
					(
						SELECT 
							CASE 
								WHEN C.IsBillTo = 1 THEN C.CustomerNo 
								ELSE C.BillToCustomerID 
							END CustomerNumber,
							CASE 
								WHEN C.IsBillTo = 1 THEN '' 
								ELSE C.CustomerNo 
							END CustomerSequence,
							C.ShipBranchOverride,
							C.PriceBranchOverride
						FROM DM_Ecommerce..Customer C (NOLOCK)
						WHERE C.EtlSourceID = @ETLSourceID
					)
				INSERT INTO [dbo].[CustomerProperty]
							([Id]
							,[CustomerId]
							,[Name]
							,[Value]
							,[CreatedOn]
							,[CreatedBy]
							,[ModifiedOn]
							,[ModifiedBy])
				SELECT 
					NEWID() Id
					, C.Id [CustomerId]
					, 'PriceBranchOverride' Name
					,PriceBranchOverride Value
					, GetDate() CreatedOn
					, @UserName CreatedBy
					, GetDate() ModifiedOn
					, @UserName ModifiedBy
				FROM ETL_Ecommerce..Customer C 
				JOIN CTE ON CTE.CustomerNumber = C.CustomerNumber 
								AND CTE.CustomerSequence = C.CustomerSequence
				WHERE CTE.PriceBranchOverride IS NOT NULL;

			--*******************************************************************************************************************
			-- Creating custom properties for the IsJobAccount field 
			--*******************************************************************************************************************
			--TRUNCATE THE EXISTING RECORDS FOR Customer IsJobAccount CUSTOMER PROPERTY
				DELETE FROM [dbo].[CustomerProperty]
				WHERE Name = 'IsJobAccount';

				INSERT INTO [dbo].[CustomerProperty]
							([Id]
							,[CustomerId]
							,[Name]
							,[Value]
							,[CreatedOn]
							,[CreatedBy]
							,[ModifiedOn]
							,[ModifiedBy])
				SELECT NEWID() Id,
					C.Id [CustomerId],
					'IsJobAccount' Name,
					'True' Value,
					 GetDate() CreatedOn
					, @UserName CreatedBy
					, GetDate() ModifiedOn
					, @UserName ModifiedBy
				FROM [dbo].[vw_QualifyingShipToCustomers] QC
				JOIN Customer C ON C.CustomerSequence = QC.CustomerNo 
				LEFT JOIN EtlTranslation T ON T.ETLSourceID = QC.ETLSourceID AND T.TargetColumn = 'CorpFlag' AND ISNULL(T.TargetValue, '') = ISNULL(QC.CorpFlag,'')
				WHERE QC.ETLSourceID = @ETLSourceID AND T.TranslatedValue = 'JobAccount'

END