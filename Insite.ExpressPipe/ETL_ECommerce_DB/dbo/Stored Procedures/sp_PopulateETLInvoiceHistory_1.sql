
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

	TRUNCATE TABLE InvoiceHistory;
	DELETE CustomProperty
	WHERE Name = @JobName

	--==========================================================================================================
	-- InvoiceHistory -- Header
	-- NOTE: Assumes customer has been loaded
	--==========================================================================================================
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
           [ModifiedBy])
	SELECT
		--NEWSEQUENTIALID() Id,
        dbo.fn_GetGenerationOrderId(I.ErpOrderNo, I.GenID, I.Gen) InvoiceNumber,
        I.ShipDate InvoiceDate,						-- NEED INVOICE DATE
        @SentinelDate DueDate,						    -- NEED INVOICE DUE DATE
        ISNULL(I.OrderType,'') InvoiceType,
        ISNULL(I.BillToNo,'') CustomerNumber,
        ISNULL(I.ShipToNo,'') CustomerSequence,
        ISNULL(CustomerPONo,'') CustomerPO,
        ISNULL(I.OrderStatus,'') Status,
		CAST(I.GenID % 2 AS BIT)  IsOpen,				-- TODO: If current balance is 0
        'USD' CurrencyCode,
        ISNULL(I.TermsCode,'') Terms,
        '' ShipCode,
        COALESCE(I.InsideSalesPersonID, I.OutsideSalesPersonID, '') Salesperson,
        ISNULL(I.BillToName,'') BTCompanyName,
        ISNULL(I.BillToAddressLine1,'') BTAddress1,
        ISNULL(I.BillToAddressLine1,'') BTAddress2,
        ISNULL(I.BIllToAddressCity,'') BTCity,
        ISNULL(I.BillToAddressState,'') BTState,
        ISNULL(I.BillToAddressPostalCode,'') BTPostalCode,
        'US' BTCountry,
        ISNULL(I.ShipToName,'') STCompanyName,
        ISNULL(I.ShipToAddressLine1,'') STAddress1,
        ISNULL(I.ShipToAddressLine2,'') STAddress2,
        ISNULL(I.ShipToCity,'') STCity,
        ISNULL(I.ShipToState,'') STState,
        ISNULL(I.ShipToPostalCode,'') STPostalCode,
        'US' STCountry,
        '' Notes,
        ISNULL(I.OrderSubTotal,0.0) ProductTotal,
        ISNULL(I.TotalDiscount,0.0) DiscountAmount,
        ISNULL(I.FreightIn, 0) + ISNULL(I.FreightOut, 0) + ISNULL(I.HandlingIn, 0) + ISNULL(I.HandlingOut, 0) ShippingAndHandling,
        0.0 OtherCharges,
        ISNULL(I.TotalTax,0.0) TaxAmount,
        ISNULL(I.OrderTotalAmount,0.0) InvoiceTotal,
        CASE WHEN I.GenID % 2 = 1 THEN I.OrderTotalAmount/10.0 ELSE 0.0 END CurrentBalance, -- TODO: FAKE DATA
        GETDATE(),
        @User ModifiedBy,
        GETDATE() ModifiedOn,
        @User ModifiedBy
	FROM ETL_ECommerce..vw_QualifyingInvoices I
	WHERE I.ETLSourceID = @ETLSourceID

	--==========================================================================================================
	--Update the IDs based on existing invoices -- using InvoiceNumber
	--==========================================================================================================
	UPDATE EIH SET EIH.Id = IIH.Id 
	  FROM InvoiceHistory EIH
	  JOIN [Insite.ExpressPipe]..InvoiceHistory IIH 
		ON EIH.InvoiceNumber = IIH.InvoiceNumber
		AND EIH.Id <> IIH.Id
	


	--==========================================================================================================
	-- Custom Properties for Job Names
	--==========================================================================================================
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

	--==========================================================================================================
	-- Currently not loading InvoiceDetail
	--==========================================================================================================

	--**************************************************************************************************************************
	--Update the existing IDs
	--**************************************************************************************************************************
	UPDATE ECP SET ECP.Id = ICP.Id FROM CustomProperty ECP 
	JOIN [Insite.ExpressPipe]..CustomProperty ICP
	ON ECP.ParentId = ICP.ParentId AND ECP.Name = ICP.Name AND ECP.Value = ICP.Value
	and ECP.Id <> ICP.Id

	--**************************************************************************************************************************
	--Temporary Fake data for Due Date
	--**************************************************************************************************************************
	
	Declare @MaxDate DateTime2 = (Select Max(InvoiceDate) from InvoiceHistory IH);
	Declare @OffSet int = DateDiff(Day, @MaxDate,GetDate() + 40);
	Update InvoiceHistory Set Duedate = DateAdd(Day,@OffSet,InvoiceDate);
	
	
END