


CREATE PROCEDURE [dbo].[sp_PopulateETLInvoiceHistory]
(
	@EtlSourceID VARCHAR(5),
	@User VARCHAR(100)
)
AS 
--*****************************************************************************************************************
-- Name:	sp_PopulateETLInvoiceHistory
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	10/2/2015 Matt Glover
-- Altered:
-- Test With: exec [sp_PopulateETLInvoiceHistory] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;
	SET ANSI_WARNINGS OFF;
	SET XACT_ABORT ON;
	
	DECLARE @SentinelDate DATETIME2 = '1900-01-01';
	DECLARE @ErrorMessage VARCHAR(100);
	DECLARE @JobName VARCHAR(10) = 'JobName'
	DECLARE @DiscountDate VARCHAR(10) = 'DiscountDate'
	DECLARE @OrderID VARCHAR(10) = 'OrderID'

	TRUNCATE TABLE InvoiceHistory;
	--**************************************************************************************************************************
	-- InvoiceHistory -- Header
	-- NOTE: Assumes customer has been loaded
	--**************************************************************************************************************************
	INSERT [dbo].[InvoiceHistory]
           ( --[Id],
           [InvoiceNumber],
           [InvoiceDate],
           [DueDate],
           [InvoiceType],
           [CustomerNumber],
           [CustomerSequence],
           [CustomerPO],
           [Status],
           [IsOpen],
           [CurrencyCode],
           [Terms],
           [ShipCode],
           [Salesperson],
           [BTCompanyName],
           [BTAddress1],
           [BTAddress2],
           [BTCity],
           [BTState],
           [BTPostalCode],
           [BTCountry],
           [STCompanyName],
           [STAddress1],
           [STAddress2],
           [STCity],
           [STState],
           [STPostalCode],
           [STCountry],
           [Notes],
           [ProductTotal],
           [DiscountAmount],
           [ShippingAndHandling],
           [OtherCharges],
           [TaxAmount],
           [InvoiceTotal],
           [CurrentBalance],
           [CreatedOn],
           [CreatedBy],
           [ModifiedOn],
           [ModifiedBy],
		   [EclipseID],
		   [GenerationID])
	SELECT
		--NEWSEQUENTIALID() Id,
        I.InvoiceId InvoiceNumber,
        I.[InvoiceDate] InvoiceDate,						
        ISNULL([DueDate],@SentinelDate) DueDate,			
        ISNULL(I.[InvoiceType],'') InvoiceType,
        ISNULL(I.[BillToCustomerID],'') CustomerNumber,
        ISNULL(I.[ShipToCustomerID],'') CustomerSequence,
        ISNULL(CustomerPO,'') CustomerPO,
        ISNULL(CASE WHEN I.[InvoiceStatus] = 'C' THEN 'Invoiced' ELSE 'Open' END,'') Status,
		CASE WHEN I.InvoiceStatus = 'C' THEN 0 ELSE 1 END IsOpen,
        'USD' CurrencyCode,
        ISNULL(I.TermsCD,'') Terms,
        '' ShipCode,
        COALESCE(I.InsideSalesPersonID, I.OutsideSalesPersonID, '') Salesperson,
		ISNULL(BTC.CustomerName,'') [BTCompanyName], 
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine1,'')) [BTAddress1],
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine2,''))  [BTAddress2],
		ISNULL(BTC.City,'') [BTCity],
		ISNULL(BTC.State,'') [BTState],
		ISNULL(BTC.Zip,'') [BTPostalCode],
		'US' [BTCountry],
		ISNULL(dbo.fn_ScrubData2(STC.CustomerName), '') [STCompanyName],
		ISNULL(STC.AddressLine1, '') [ShipToAddress1],
		ISNULL(STC.AddressLine2, '') [ShipToAddress2],
   		ISNULL(STC.City, '') [STCity],
   		ISNULL(STC.State, '') [STState],
		ISNULL(STC.Zip, '') [STPostalCode],
		'US' [STCountry],
        '' Notes,
        ISNULL(I.[SubTotalAmount],0.0) ProductTotal,
        ISNULL(I.[DiscountAmount],0.0) DiscountAmount,
        ISNULL(I.[FreightAmount], 0) + ISNULL(I.[HandlingAmount], 0) ShippingAndHandling,
        0.0 OtherCharges,
        ISNULL(I.[SalesTaxAmount],0.0) TaxAmount,
        ISNULL(I.[InvoiceAmount],0.0) InvoiceTotal,
        [BalanceDueAmount] CurrentBalance, -- TODO: FAKE DATA
        GETDATE(),
        @User ModifiedBy,
        GETDATE() ModifiedOn,
        @User ModifiedBy,
		EclipseID,
		GenerationID
	FROM dbo.vw_QualifyingInvoices I
	JOIN [dbo].[vw_QualifyingBillToCustomers] BTC ON BTC.ETLSourceID = I.ETLSourceID
	                                             AND BTC.CustomerNo = I.[BillToCustomerID]
	LEFT JOIN [dbo].[vw_QualifyingShipToCustomers] STC ON STC.ETLSourceID = I.ETLSourceID
	                                             AND STC.CustomerNo = I.[ShipToCustomerID]
	WHERE I.ETLSourceID = @ETLSourceID

		--**************************************************************************************************************************
		--Update the IDs based on existing invoices -- using InvoiceNumber
		--**************************************************************************************************************************
		UPDATE EIH SET EIH.Id = IIH.Id 
		  FROM InvoiceHistory EIH (NOLOCK)
		  JOIN [Insite.Morsco]..InvoiceHistory IIH (NOLOCK)
			ON EIH.InvoiceNumber = IIH.InvoiceNumber
			AND EIH.Id <> IIH.Id
	


		--**************************************************************************************************************************
		-- Custom Properties for Job Names
		--**************************************************************************************************************************
		
		DELETE CustomProperty WHERE Name = @JobName
		
		INSERT INTO [dbo].[CustomProperty]
			([Id],
			[ParentId],
			[Name],
			[Value],
			[CreatedOn],
			[CreatedBy],
			[ModifiedOn],
			[ModifiedBy])
		SELECT
			NEWID(),
			I.ID ParentId,
			@JobName Name,
			C.CompanyName Value,
			GETDATE(),
			@User ModifiedBy,
			GETDATE() ModifiedOn,
			@User ModifiedBy
		FROM InvoiceHistory I (NOLOCK)
		JOIN Customer C (NOLOCK) ON C.CustomerNumber = I.CustomerNumber
								AND C.CustomerSequence = I.CustomerSequence

		--**************************************************************************************************************************
		-- Custom Properties for Discount Date
		--**************************************************************************************************************************

		DELETE CustomProperty WHERE Name = @DiscountDate

		INSERT INTO [dbo].[CustomProperty]
			([Id],
			[ParentId],
			[Name],
			[Value],
			[CreatedOn],
			[CreatedBy],
			[ModifiedOn],
			[ModifiedBy])
		SELECT
			NEWID(),
			IH.ID ParentId,
			'DiscountDate' Name,
			QI.DiscountDate Value,
			GETDATE(),
			@User ModifiedBy,
			GETDATE() ModifiedOn,
			@User ModifiedBy
		FROM [dbo].[vw_QualifyingInvoices] QI
		JOIN INvoiceHistory IH ON QI.InvoiceId = IH.[InvoiceNumber]


		--**************************************************************************************************************************
		-- Custom Properties for OrderID
		--**************************************************************************************************************************

		DELETE CustomProperty WHERE Name = @OrderID

		INSERT INTO [dbo].[CustomProperty]
			([Id],
			[ParentId],
			[Name],
			[Value],
			[CreatedOn],
			[CreatedBy],
			[ModifiedOn],
			[ModifiedBy])
		SELECT
			NEWID(),
			IH.ID ParentId,
			'OrderId' Name,
			QH.ShipmentID Value,
			GETDATE(),
			@User ModifiedBy,
			GETDATE() ModifiedOn,
			@User ModifiedBy
		FROM vw_QualifyingShipments QH
		JOIN vw_QualifyingInvoices QI ON QH.EclipseID = QI.EclipseID 
										  AND QH.GenerationID = QI.GenerationID 
										  AND QH.ETLSourceID = QH.ETLSourceID
		JOIN INvoiceHistory IH ON QI.InvoiceId = IH.[InvoiceNumber]
		WHERE QH.ETLSourceID = @ETLSourceId
		

		--**************************************************************************************************************************
		-- Currently not loading InvoiceDetail
		--**************************************************************************************************************************

		--**************************************************************************************************************************
		--Update the existing IDs
		--**************************************************************************************************************************
		UPDATE ECP SET ECP.Id = ICP.Id FROM CustomProperty ECP (NOLOCK)
		JOIN [Insite.Morsco]..CustomProperty ICP (NOLOCK)
		ON ECP.ParentId = ICP.ParentId AND ECP.Name = ICP.Name AND ECP.Value = ICP.Value
		and ECP.Id <> ICP.Id

END