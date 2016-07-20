CREATE PROCEDURE [dbo].[sp_PopulateInsiteInvoiceHistory]
--*****************************************************************************************************************
-- Name:	[sp_PopulateInsiteInvoiceHistory]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateInsiteInvoiceHistory] 'ServiceUser'
--*****************************************************************************************************************
(
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE [Insite.Morsco]..InvoiceHistory AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..InvoiceHistory AS Source
			) AS Source
			ON Target.Id = Source.Id
		WHEN MATCHED AND 
			(
				Target.InvoiceNumber <> Source.InvoiceNumber
				OR Target.InvoiceDate <> Source.InvoiceDate
				OR Target.DueDate <> Source.DueDate
				OR Target.InvoiceType <> Source.InvoiceType
				OR Target.CustomerNumber <> Source.CustomerNumber
				OR Target.CustomerSequence <> Source.CustomerSequence
				OR Target.CustomerPO <> Source.CustomerPO
				OR Target.Status <> Source.Status
				OR Target.IsOpen <> Source.IsOpen
				OR Target.CurrencyCode <> Source.CurrencyCode
				OR Target.Terms <> Source.Terms
				OR Target.ShipCode <> Source.ShipCode
				OR Target.Salesperson <> Source.Salesperson
				OR Target.BTCompanyName <> Source.BTCompanyName
				OR Target.BTAddress1 <> Source.BTAddress1
				OR Target.BTAddress2 <> Source.BTAddress2
				OR Target.BTCity <> Source.BTCity
				OR Target.BTState <> Source.BTState
				OR Target.BTPostalCode <> Source.BTPostalCode
				OR Target.BTCountry <> Source.BTCountry
				OR Target.STCompanyName <> Source.STCompanyName
				OR Target.STAddress1 <> Source.STAddress1
				OR Target.STAddress2 <> Source.STAddress2
				OR Target.STCity <> Source.STCity
				OR Target.STState <> Source.STState
				OR Target.STPostalCode <> Source.STPostalCode
				OR Target.STCountry <> Source.STCountry
				OR Target.Notes <> Source.Notes
				OR Target.ProductTotal <> Source.ProductTotal
				OR Target.DiscountAmount <> Source.DiscountAmount
				OR Target.ShippingAndHandling <> Source.ShippingAndHandling
				OR Target.OtherCharges <> Source.OtherCharges
				OR Target.TaxAmount <> Source.TaxAmount
				OR Target.InvoiceTotal <> Source.InvoiceTotal
				OR Target.CurrentBalance <> Source.CurrentBalance
			) THEN
			UPDATE SET 
				Target.InvoiceNumber = Source.InvoiceNumber,
				Target.InvoiceDate = Source.InvoiceDate,
				Target.DueDate = Source.DueDate,
				Target.InvoiceType = Source.InvoiceType,
				Target.CustomerNumber = Source.CustomerNumber,
				Target.CustomerSequence = Source.CustomerSequence,
				Target.CustomerPO = Source.CustomerPO,
				Target.Status = Source.Status,
				Target.IsOpen = Source.IsOpen,
				Target.CurrencyCode = Source.CurrencyCode,
				Target.Terms = Source.Terms,
				Target.ShipCode = Source.ShipCode,
				Target.Salesperson = Source.Salesperson,
				Target.BTCompanyName = Source.BTCompanyName,
				Target.BTAddress1 = Source.BTAddress1,
				Target.BTAddress2 = Source.BTAddress2,
				Target.BTCity = Source.BTCity,
				Target.BTState = Source.BTState,
				Target.BTPostalCode = Source.BTPostalCode,
				Target.BTCountry = Source.BTCountry,
				Target.STCompanyName = Source.STCompanyName,
				Target.STAddress1 = Source.STAddress1,
				Target.STAddress2 = Source.STAddress2,
				Target.STCity = Source.STCity,
				Target.STState = Source.STState,
				Target.STPostalCode = Source.STPostalCode,
				Target.STCountry = Source.STCountry,
				Target.Notes = Source.Notes,
				Target.ProductTotal = Source.ProductTotal,
				Target.DiscountAmount = Source.DiscountAmount,
				Target.ShippingAndHandling = Source.ShippingAndHandling,
				Target.OtherCharges = Source.OtherCharges,
				Target.TaxAmount = Source.TaxAmount,
				Target.InvoiceTotal = Source.InvoiceTotal,
				Target.CurrentBalance = Source.CurrentBalance,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      InvoiceNumber,
			      InvoiceDate,
			      DueDate,
			      InvoiceType,
			      CustomerNumber,
			      CustomerSequence,
			      CustomerPO,
			      Status,
			      IsOpen,
			      CurrencyCode,
			      Terms,
			      ShipCode,
			      Salesperson,
			      BTCompanyName,
			      BTAddress1,
			      BTAddress2,
			      BTCity,
			      BTState,
			      BTPostalCode,
			      BTCountry,
			      STCompanyName,
			      STAddress1,
			      STAddress2,
			      STCity,
			      STState,
			      STPostalCode,
			      STCountry,
			      Notes,
			      ProductTotal,
			      DiscountAmount,
			      ShippingAndHandling,
			      OtherCharges,
			      TaxAmount,
			      InvoiceTotal,
			      CurrentBalance,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.InvoiceNumber,
			   Source.InvoiceDate,
			   Source.DueDate,
			   Source.InvoiceType,
			   Source.CustomerNumber,
			   Source.CustomerSequence,
			   Source.CustomerPO,
			   Source.Status,
			   Source.IsOpen,
			   Source.CurrencyCode,
			   Source.Terms,
			   Source.ShipCode,
			   Source.Salesperson,
			   Source.BTCompanyName,
			   Source.BTAddress1,
			   Source.BTAddress2,
			   Source.BTCity,
			   Source.BTState,
			   Source.BTPostalCode,
			   Source.BTCountry,
			   Source.STCompanyName,
			   Source.STAddress1,
			   Source.STAddress2,
			   Source.STCity,
			   Source.STState,
			   Source.STPostalCode,
			   Source.STCountry,
			   Source.Notes,
			   Source.ProductTotal,
			   Source.DiscountAmount,
			   Source.ShippingAndHandling,
			   Source.OtherCharges,
			   Source.TaxAmount,
			   Source.InvoiceTotal,
			   Source.CurrentBalance,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END