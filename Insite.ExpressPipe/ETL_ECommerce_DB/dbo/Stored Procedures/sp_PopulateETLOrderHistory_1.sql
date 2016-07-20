

CREATE PROCEDURE [dbo].[sp_PopulateETLOrderHistory]
(
	@EtlSourceID VARCHAR(5),
	@User VARCHAR(100)
)
AS 
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLOrderHistory]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLOrderHistory] 'EXP', 'ServiceUser'
--*****************************************************************************************************************
BEGIN
	SET NOCOUNT ON;
	SET ANSI_WARNINGS OFF;
	SET XACT_ABORT ON;
	
	DECLARE @SentinelDate DATETIME2 = '1900-01-01';
	DECLARE @ErrorMessage VARCHAR(100);
	--==========================================================================================================
	-- Delete current tables
	--==========================================================================================================
print '1 ' + convert(varchar(25), getdate() ,121)

	-- Drop FK constraints so we can truncate -- saves minutes
	ALTER TABLE [dbo].[OrderHistoryLine] DROP CONSTRAINT [FK_OrderHistoryLine_OrderHistory]

	--If we can truncate, they're not logged, so transaction should not help
	TRUNCATE TABLE OrderHistoryLine
	TRUNCATE TABLE OrderHistory
		
	-- Re-add FK Constraints
	ALTER TABLE [dbo].[OrderHistoryLine]  WITH NOCHECK ADD  CONSTRAINT [FK_OrderHistoryLine_OrderHistory] FOREIGN KEY([OrderHistoryId])
	REFERENCES [dbo].[OrderHistory] ([Id])
	ON DELETE CASCADE
print '2 ' + convert(varchar(25), getdate() ,121)	

	--==========================================================================================================
	-- Insert OrderHistory for rolled up 'Master' Orders
	--==========================================================================================================
	-- Some fields (like address and name) need consistent information from a single row.  We'll use the lowest generation row
	-- That's what these first 2 CTEs do
	-- This CTE is everything that needs to roll up, except OrderStatus
	;WITH SummarizedOrder0 AS
	(
		SELECT 
			H.EclipseId,
			-- Going to do Ship Code if all generations are the same.  Otherwise Multiple(3)
			ISNULL(COUNT(DISTINCT H.ShipViaID), 0) ShipViaCount,
			ISNULL(MAX(H.ShipViaID), '') MaxShipVia,
			ISNULL(SUM(H.[FreightAmount]), 0) + ISNULL(SUM(H.[HandlingAmount]), 0) ShippingAndHandling,
			ISNULL(SUM(H.[SubTotalAmount]), 0) OrderSubTotal,
			ISNULL(SUM(H.[DiscountAmount]), 0) TotalDiscount,
			ISNULL(SUM(H.[SalesTaxAmount]), 0) TotalTax,
			ISNULL(SUM(H.[ShipmentAmount]), 0) OrderTotalAmount,
			ISNULL(SUM(CASE WHEN I.InvoiceId is not null then 1 else 0 end), 0) InvoicedOrdersCount,
			ISNULL(MAX(H.OutsideSalespersonID),'') MaxOutsideSalesPersonID,
			ISNULL(MAX(H.InsideSalespersonID),'') MaxInsideSalesPersonID,
			ISNULL(MAX(H.GenerationCount),0) GenerationCount,
			ISNULL(MAX(H.ETLSourceId),'') ETLSourceId
		FROM vw_QualifyingShipments H
		LEFT JOIN vw_QualifyingInvoices I ON H.EclipseID = I.EclipseID 
										  AND H.GenerationID = I.GenerationID 
										  AND H.ETLSourceID = I.ETLSourceID
		WHERE H.ETLSourceID = @ETLSourceId
		GROUP BY H.EclipseId
	),
	SummarizedOrder AS
	(
		SELECT
			S.EclipseId,
			CASE WHEN S.ShipViaCount = 0 THEN ''
					WHEN S.ShipViaCount = 1 THEN S.MaxShipVia
					ELSE 'Multiple(' + CAST(S.ShipViaCount AS VARCHAR(10)) + ')'
			END [ShipCode],
			S.ShippingAndHandling,
			S.OrderSubTotal,
			S.TotalDiscount,
			S.TotalTax,
			S.OrderTotalAmount,
			CASE 
				WHEN S.InvoicedOrdersCount = S.GenerationCount THEN 'Invoiced'
				ELSE 'Open'
			END OrderStatus,
			ISNULL(SP.SalesPersonName,'') SalesPerson,
			S.ETLSourceId
		FROM SummarizedOrder0 S
		LEFT JOIN DM_ECommerce.dbo.SalesPerson SP (NOLOCK) ON SP.ETLSourceID = S.ETLSourceId
															AND SP.SalesPersonId = COALESCE(S.MaxOutsideSalesPersonid, S.MaxInsideSalesPersonID, '')
		WHERE SP.ETLSourceID = @EtlSourceID
	)
	INSERT OrderHistory
		(
		--[Id],
		[ERPOrderNumber]
		,[WebOrderNumber]
		,[OrderDate]
		,[Status]
		,[CustomerNumber]
		,[CustomerSequence]
		,[CustomerPO]
		,[CurrencyCode]
		,[Terms]
		,[ShipCode]
		,[Salesperson]
		,[BTCompanyName]
		,[BTAddress1]
		,[BTAddress2]
		,[BTCity]
		,[BTState]
		,[BTPostalCode]
		,[BTCountry]
		,[STCompanyName]
		,[STAddress1]
		,[STAddress2]
		,[STCity]
		,[STState]
		,[STPostalCode]
		,[STCountry]
		,[Notes]
		,[ProductTotal]
		,[DiscountAmount]
		,[ShippingAndHandling]
		,[OtherCharges]
		,[TaxAmount]
		,[OrderTotal]
		,[ModifiedOn]
		,[ConversionRate]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedBy]
		,[OrderedBy]
		,[GenerationCount])
	SELECT 
		O1.EclipseId,
		'' [WebOrderNumber],
		O1.[OrderDate] [OrderDate],
		O2.OrderStatus [Status],
		O1.[BillToCustomerID] [CustomerNumber],		
		O1.[ShipToCustomerID] [CustomerSequence],
		dbo.fn_ScrubData2(ISNULL(O1.CustomerPO,'')) [CustomerPO],
		'USD' [CurrencyCode],
		ISNULL(O1.TermsCD,'') [Terms],
		O2.ShipCode,
		O2.SalesPerson [Salesperson],
		ISNULL(BTC.CustomerName,'') [BTCompanyName], 
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine1,'')) [BTAddress1],
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine2,''))  [BTAddress2],
		ISNULL(BTC.City,'') [BTCity],
		ISNULL(BTC.State,'') [BTState],
		ISNULL(BTC.Zip,'') [BTPostalCode],
		'US' [BTCountry],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Name ,'')
			ELSE ISNULL(dbo.fn_ScrubData2(STC.CustomerName), '') 
		END [STCompanyName],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Address1,'')
			ELSE ISNULL(O1.ShipToAddress1, '')
		END [ShipToAddress1],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Address2,'')
			ELSE ISNULL(O1.ShipToAddress2, '')
		END [ShipToAddress2],
   		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.City,'')
			ELSE ISNULL(O1.ShipToCity, '')
		END [STCity],
   		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.State,'')
			ELSE ISNULL(O1.ShipToState, '')
		END [STState],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Zip,'')
			ELSE ISNULL(O1.ShipToZip, '') 
		END [STPostalCode],
		'US' [STCountry],
		'' [Notes],
		O2.OrderSubTotal [ProductTotal], 
		O2.TotalDiscount [DiscountAmount],
		O2.ShippingAndHandling,
		0 [OtherCharges],
		O2.TotalTax [TaxAmount],
		O2.OrderTotalAmount [OrderTotal],
		GETDATE() [ModifiedOn],
		0 [ConversionRate],
		GETDATE() [CreatedOn],
		@User [CreatedBy],
		@User [ModifiedBy],
		dbo.fn_ScrubData2(O1.OrderedBy) [OrderedBy],
		O1.GenerationCount [GenerationCount]
	FROM dbo.vw_QualifyingShipments O1
	JOIN SummarizedOrder O2 ON O2.EclipseId = O1.EclipseId 
	                        AND O1.ETLSourceID = O2.ETLSourceID
	JOIN dbo.vw_QualifyingBillToCustomers BTC ON BTC.ETLSourceID = O1.ETLSourceID
		                                      AND BTC.CustomerNo = O1.BillToCustomerID
	LEFT JOIN vw_QualifyingShipToCustomers STC ON STC.ETLSourceID = O1.ETLSOurceID
	                                           AND STC.CustomerNo = O1.ShipToCustomerID
	LEFT JOIN DM_ECommerce.dbo.Branch B (NOLOCK) ON B.ETLSourceID = O1.ETLSourceID
		                                         AND B.BranchID = O1.ShipBranchID  
	LEFT JOIN ETLTranslation E ON E.ETLSourceID = O1.ETLSourceID
								AND E.TargetColumn = 'ShipVia'
								AND E.TargetValue = O1.ShipViaId
	WHERE O1.ETLSourceId = @ETLSourceId
	AND O1.GenRowNo = 1 
	AND O1.GenerationCount > 1 
print '3 ' + convert(varchar(25), getdate() ,121)

	--==========================================================================================================
	-- Insert OrderHistory for Generations
	--==========================================================================================================
	-- Avoid duplicate salespeople as a multiplier.  Happened twice, so assume we need to harden against.
	-- Are other salesperson references in this sp.  But not used as joined tables in main query.
	;WITH CTESalespersonWDup AS
	(
		SELECT ROW_NUMBER() OVER (Partition By SalespersonID Order By SalespersonName) Row,
			*
		FROM [DM_ECommerce]..Salesperson ISP (NOLOCK) 
		WHERE ISP.ETLSourceID = @ETLSourceId
	),
	CTESalesperson AS
	(
		SELECT * FROM CTESalespersonWDup WHERE Row = 1
	)
	INSERT OrderHistory
		(
		--[Id],
		[ERPOrderNumber]
		,[WebOrderNumber]
		,[OrderDate]
		,[Status]
		,[CustomerNumber]
		,[CustomerSequence]
		,[CustomerPO]
		,[CurrencyCode]
		,[Terms]
		,[ShipCode]
		,[Salesperson]
		,[BTCompanyName]
		,[BTAddress1]
		,[BTAddress2]
		,[BTCity]
		,[BTState]
		,[BTPostalCode]
		,[BTCountry]
		,[STCompanyName]
		,[STAddress1]
		,[STAddress2]
		,[STCity]
		,[STState]
		,[STPostalCode]
		,[STCountry]
		,[Notes]
		,[ProductTotal]
		,[DiscountAmount]
		,[ShippingAndHandling]
		,[OtherCharges]
		,[TaxAmount]
		,[OrderTotal]
		,[ModifiedOn]
		,[ConversionRate]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedBy]
		,[OrderedBy]
		,[GenerationCount]
		,[InvoiceDate]
		,[EclipseID]
		,[GenerationID]
		)
	SELECT
		H.ShipmentId [ERPOrderNumber],
		'' [WebOrderNumber],
		H.OrderDate[OrderDate],
		CASE WHEN I.InvoiceID IS NOT NULL THEN 'Invoiced' ELSE 'Open' END [Status],
		H.[BillToCustomerID] [CustomerNumber],
		H.[ShipToCustomerID] [CustomerSequence],
		dbo.fn_ScrubData2(ISNULL(H.CustomerPO, '')) [CustomerPO],
		'USD' [CurrencyCode],
		ISNULL(H.TermsCD,'') [Terms],
		ISNULL(H.ShipViaID,'') [ShipCode],
		COALESCE(ISP.SalespersonName, H.InsideSalespersonID, OSP.SalespersonName, H.OutsideSalespersonID, '') [Salesperson],
		ISNULL(BTC.CustomerName,'') [BTCompanyName], 
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine1,'')) [BTAddress1],
		dbo.fn_ScrubData2(ISNULL(BTC.AddressLine2,''))  [BTAddress2],
		ISNULL(BTC.City,'') [BTCity],
		ISNULL(BTC.State,'') [BTState],
		ISNULL(BTC.Zip,'') [BTPostalCode],
		'US' [BTCountry],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Name,'') 
			ELSE ISNULL(dbo.fn_ScrubData2(STC.CustomerName), '') 
		END [STCompanyName],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Address1,'')
			ELSE ISNULL(H.ShipToAddress1, '')
		END [ShipToAddress1],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Address2,'')
			ELSE ISNULL(H.ShipToAddress2, '')
		END [ShipToAddress2],
   		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.City,'')
			ELSE ISNULL(H.ShipToCity, '')
		END [STCity],
   		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.State,'')
			ELSE ISNULL(H.ShipToState, '')
		END [STState],
		CASE WHEN E.TranslatedValue = 'Will Call' THEN ISNULL(B.Zip,'')
			ELSE ISNULL(H.ShipToZip, '') 
		END [STPostalCode],
		'US' [STCountry],
		'' [Notes],
		ISNULL(H.[SubTotalAmount], 0) [ProductTotal],
		ISNULL(H.[DiscountAmount], 0) [DiscountAmount],
		ISNULL(H.[FreightAmount], 0) + ISNULL(H.[HandlingAmount], 0) ShippingAndHandling,
		0 [OtherCharges],
		ISNULL(H.[SalesTaxAmount], 0) [TaxAmount],
		ISNULL(H.[ShipmentAmount], 0) [OrderTotal],
		GETDATE() [ModifiedOn],
		0 [ConversionRate],
		GETDATE() [CreatedOn],
		@User [CreatedBy],
		@User [ModifiedBy],
		dbo.fn_ScrubData2(ISNULL(H.OrderedBy, '')) [OrderedBy],
		H.GenerationCount [GenerationCount],
		I.InvoiceDate [InvoiceDate],
		H.EclipseID,
		H.GenerationID
	FROM dbo.vw_QualifyingShipments H
	LEFT JOIN dbo.vw_QualifyingInvoices I ON I.ETLSourceID = H.ETLSourceID
											AND I.EclipseID = H.EclipseID
		                                    AND I.GenerationID = H.GenerationID
	JOIN dbo.vw_QualifyingBillToCustomers BTC ON BTC.ETLSourceID = H.ETLSourceID
		                                     AND BTC.CustomerNo = H.BillToCustomerID
	-- ship-to-customers may not be qualifying customers for historical orders at the bill-to-level orderhistory page
	LEFT JOIN vw_QualifyingShipToCustomers STC ON STC.ETLSourceID = H.ETLSOurceID
	                                          AND STC.CustomerNo = H.ShipToCustomerID
	LEFT JOIN DM_ECommerce..Branch B (NOLOCK) ON B.ETLSourceID = H.EtlSourceId
										AND B.BranchID = H.ShipBranchID
	LEFT JOIN ETLTranslation E ON E.ETLSourceID = H.EtlSourceId
								AND E.TargetColumn = 'ShipVia'
								AND E.TargetValue = H.ShipViaID
	LEFT JOIN CTESalesperson ISP (NOLOCK) ON ISP.ETLSourceID = H.EtlSourceId
											AND ISP.SalesPersonID = H.InsideSalesPersonID
	LEFT JOIN CTESalesPerson OSP (NOLOCK) ON OSP.ETLSourceID = H.EtlSourceId
											AND OSP.SalesPersonID = H.OutsideSalesPersonID
	WHERE H.ETLSourceID = @ETLSourceID 
print '4 ' + convert(varchar(25), getdate() ,121)	

	--==========================================================================================================
	-- Get the IDs to be used in Merging
	--==========================================================================================================
	UPDATE New
		SET New.ID = Existing.ID
	FROM OrderHistory New
	JOIN [Insite.Morsco]..OrderHistory Existing (NOLOCK) ON Existing.ErpOrderNumber = New.ERPOrderNumber
print '5 ' + convert(varchar(25), getdate() ,121)

	--==========================================================================================================
	-- Insert OrderHistoryLine for rolled up 'Master' orders
	--==========================================================================================================
	-- Discovered products are not unique
	;WITH p AS
	(
		SELECT ERPPartNo, MAX(BaseUnitOfMeasure) BaseUnitOfMeasure
		FROM DM_ECommerce.dbo.Product P (NOLOCK)
		WHERE P.ETLSourceId = @EtlSourceID
		GROUP BY ERPPartNo
	)
	INSERT OrderHistoryLine
		(
		--[Id],
		[OrderHistoryId]
		,[RequiredDate]
		,[LastShipDate]
		,[CustomerNumber]
		,[CustomerSequence]
		,[LineType]
		,[Status]
		,[LineNumber]
		,[ReleaseNumber]
		,[ProductERPNumber]
		,[CustomerProductNumber]
		,[LinePOReference]
		,[Description]
		,[Warehouse]
		,[Notes]
		,[QtyOrdered]
		,[QtyShipped]
		,[UnitOfMeasure]
		,[InventoryQtyOrdered]
		,[InventoryQtyShipped]
		,[UnitPrice]
		,[DiscountPercent]
		,[DiscountAmount]
		,[PromotionAmountApplied]
		,[LineTotal]
		,[RMAQtyRequested]
		,[RMAQtyReceived]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy]
		)
	SELECT
		OH.Id [OrderHistoryId],
		NULL [RequiredDate],
		ISNULL(MAX(H.ShipDate), @SentinelDate) [LastShipDate],
		ISNULL(MAX(OH.CustomerNumber), '') [CustomerNumber],
		ISNULL(MAX(H.[ShipToCustomerID]), '') [CustomerSequence],
		'' [LineType],
		'' [Status],
		-- Setting LineNumber and ReleaseNumber because OrderHistoryId, Line, ReleaseNumber must be 
		-- unique combination in Insite
		ISNULL(L.LineNumber,0) [LineNumber],    
		-- Nonnumeric productids happen 0 or 1 time per order, so it is safe to coerce them to be a '0' ReleaseNumber
		ISNULL(CASE WHEN ISNUMERIC(L.ProductId) = 1 THEN CAST(L.ProductId as Decimal(18,5)) ELSE 0 END ,0 ) [ReleaseNumber], 
		ISNULL(L.ProductId,'') [ProductERPNumber],
		'' [CustomerProductNumber],
		'' [LinePOReference],
		'' [Description], -- previously did this, the MAX(I.ErpPartName) eventually broke SQL performance -- dbo.fn_ScrubData2(ISNULL(MAX(I.ErpPartName),'')) [Description],
		'' [Warehouse],						-- May have multiple warehouses
		'' [Notes],
		ISNULL(MAX(L.[OrderQty]), 0) [QtyOrdered],
		SUM(CASE WHEN I.InvoiceID IS NOT NULL THEN ISNULL(L.ShippedQty,0) ELSE 0 END) [QtyShipped], 
		ISNULL(MAX(P.BaseUnitOfMeasure),'') [UnitOfMeasure],
		0 [InventoryQtyOrdered],
		0 [InventoryQtyShipped],
		ISNULL(MAX(L.[Price]),0) [UnitPrice],
		0 [DiscountPercent],
		0 [DiscountAmount],
		0 [PromotionAmountApplied],
		SUM(COALESCE(L.ShippedQty, L.[OrderQty], 0) * ISNULL(L.[Price],0)) [LineTotal],
		0 [RMAQtyRequested],
		0 [RMAQtyReceived],
		GETDATE() [CreatedOn],
		@ETLSourceId [CreatedBy],
		GETDATE() [ModifiedOn],
		@ETLSourceId ModifiedBy
	FROM dbo.vw_QualifyingShipments H
	LEFT JOIN dbo.vw_QualifyingInvoices I ON I.ETLSourceID = H.ETLSourceID
		                                    AND I.EclipseID = H.EclipseID
		                                    AND I.GenerationID = H.GenerationID
	JOIN dbo.vw_QualifyingShipmentLines L ON L.ETLSourceId = H.EtlSourceID
											AND L.ShipmentID = H.ShipmentID
	JOIN OrderHistory OH (NOLOCK) ON OH.ERPOrderNumber = H.EclipseId
	LEFT JOIN P ON P.ERPPartNo = L.ProductId
	WHERE H.ETLSourceId = @ETLSourceId 
	AND H.GenerationCount > 1 
	AND L.ProductId IS NOT NULL
	GROUP BY OH.ERPOrderNumber, L.ProductId, L.LineNumber, OH.ID
print '6 ' + convert(varchar(25), getdate() ,121)

	--==========================================================================================================
	-- Insert OrderHistoryLine for Generation orders
	-- These are also rolled up by LineNo and Product -- appears to make LineNo unique which is necessary
	--==========================================================================================================
	;WITH p AS
	(
		SELECT ERPPartNo, MAX(BaseUnitOfMeasure) BaseUnitOfMeasure
		FROM DM_ECommerce.dbo.Product P (NOLOCK)
		WHERE P.ETLSourceId = @EtlSourceID
		GROUP BY ERPPartNo
	)
	INSERT OrderHistoryLine
		(
		--[Id],
		[OrderHistoryId]
		,[RequiredDate]
		,[LastShipDate]
		,[CustomerNumber]
		,[CustomerSequence]
		,[LineType]
		,[Status]
		,[LineNumber]
		,[ReleaseNumber]
		,[ProductERPNumber]
		,[CustomerProductNumber]
		,[LinePOReference]
		,[Description]
		,[Warehouse]
		,[Notes]
		,[QtyOrdered]
		,[QtyShipped]
		,[UnitOfMeasure]
		,[InventoryQtyOrdered]
		,[InventoryQtyShipped]
		,[UnitPrice]
		,[DiscountPercent]
		,[DiscountAmount]
		,[PromotionAmountApplied]
		,[LineTotal]
		,[RMAQtyRequested]
		,[RMAQtyReceived]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy]
		)
	SELECT
		OH.Id [OrderHistoryId],
		NULL [RequiredDate],
		MAX(ISNULL(H.ShipDate, @SentinelDate)) [LastShipDate],
		MAX(OH.CustomerNumber) [CustomerNumber],
		MAX(H.[ShipToCustomerID]) [CustomerSequence],
		'' [LineType],
		'' [Status],
		-- Setting LineNumber and ReleaseNumber because OrderHistoryId, Line, ReleaseNumber must be 
		-- unique combination in Insite
		ISNULL(L.LineNumber,0) [LineNumber],    
		-- Nonnumeric productids happen 0 or 1 time per order, so it is safe to coerce them to be a '0' ReleaseNumber
		ISNULL(CASE WHEN ISNUMERIC(L.ProductId) = 1 THEN CAST(L.ProductId as Decimal(18,5)) ELSE 0 END, 0 ) [ReleaseNumber], 
		L.ProductId [ProductERPNumber],
		'' [CustomerProductNumber],
		'' [LinePOReference],
		'' [Description], -- Previously did this, the MAX(I.ErpPartName) increased time of query to approx 1 hr dbo.fn_ScrubData2(MAX(ISNULL(I.ErpPartName,''))) [Description],
		'' [Warehouse],						-- May have multiple warehouses
		'' [Notes],
		MAX(ISNULL(L.OrderQty, 0)) [QtyOrdered],
		MAX(ISNULL(L.ShippedQty, 0)) [QtyShipped],
		MAX(ISNULL(P.BaseUnitOfMeasure,'')) [UnitOfMeasure],
		0 [InventoryQtyOrdered],
		0 [InventoryQtyShipped],
		MAX(ISNULL(L.Price,0)) [UnitPrice],
		0 [DiscountPercent],
		0 [DiscountAmount],
		0 [PromotionAmountApplied],
		MAX(COALESCE(L.ShippedQty, L.OrderQty, 0) * ISNULL(L.Price, 0)) [LineTotal],
		0 [RMAQtyRequested],
		0 [RMAQtyReceived],
		GETDATE() [CreatedOn],
		@ETLSourceId [CreatedBy],
		GETDATE() [ModifiedOn],
		@ETLSourceId [ModifiedBy]
	FROM dbo.vw_QualifyingShipments H
	JOIN dbo.vw_QualifyingShipmentLines L ON L.ETLSourceId = H.EtlSourceID
									AND L.ShipmentID = H.ShipmentID
	JOIN OrderHistory OH (NOLOCK) ON OH.ERPOrderNumber = H.ShipmentId
	LEFT JOIN P ON P.ERPPartNo = L.ProductId
	WHERE L.ETLSourceID = @EtlSourceId
	AND L.ProductId IS NOT NULL
	GROUP BY L.ShipmentID, L.ProductId, L.LineNumber, OH.ID
print '7 ' + convert(varchar(25), getdate() ,121)		

	--==========================================================================================================
	-- Get the IDs to be used in Merging
	--==========================================================================================================
	UPDATE New
		SET New.ID = Existing.ID
	FROM OrderHistoryLine New
	JOIN [Insite.Morsco]..OrderHistoryLine Existing (NOLOCK)
														ON Existing.OrderHistoryId = New.OrderHistoryId
														AND Existing.ProductERPNumber = New.ProductERPNumber
														AND Existing.LineNumber = New.LineNumber
print '8 ' + convert(varchar(25), getdate() ,121)

	--*******************************************************************************************************************
	-- Creating custom properties for the OrderedBy field and getting them out of OrderHistory Notes field
	--*******************************************************************************************************************
	--TRUNCATE THE EXISTING RECORDS FOR ORDEREDBY CUSTOMER PROPERTY
	DELETE FROM [dbo].[CustomProperty]
	WHERE Name = 'OrderedBy';

	-- Same records for all the levels (Master and Generation Levels)
	INSERT INTO [dbo].[CustomProperty]
		([Id]
		,[ParentId]
		,[Name]
		,[Value]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT NEWID() ID
		,OH.Id [ParentId]
		,'OrderedBy' [Name] 
		,ISNULL(OH.OrderedBy,'') [Value]
		,GETDATE() [CreatedOn]
		,@User [CreatedBy]
		,GETDATE() [ModifiedOn]
		,@User [ModifiedBy]
	FROM OrderHistory OH (NOLOCK)
print '9 ' + convert(varchar(25), getdate() ,121)

	--*******************************************************************************************************************

	--*******************************************************************************************************************
	-- Creating custom properties for the LastShipDate field 
	--*******************************************************************************************************************

	--TRUNCATE THE EXISTING RECORDS FOR LAST SHIP DATE CUSTOMER PROPERTY
	DELETE FROM [dbo].[CustomProperty]
	WHERE Name = 'LastShipDate';
print '10 ' + convert(varchar(25), getdate() ,121)		

	--Property only generation level and single-level parents.
	INSERT INTO [dbo].[CustomProperty]
		([Id]
		,[ParentId]
		,[Name]
		,[Value]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT NEWID() ID,
		oh.id ParentId, 
		'LastShipDate' Name, 
		CASE WHEN OH.ERPOrderNumber like '%.%' OR MAX(GenerationCount) = 1
			THEN convert(nvarchar(10),Max(ISNULL(ohl.lastshipdate,@SentinelDate)), 120)
			ELSE ''
		END,
		GETDATE(), 
		@User, 
		GETDATE(), 
		@User
	FROM OrderHistory oh (NOLOCK)
	LEFT JOIN OrderHistoryLine ohl (NOLOCK) on ohl.OrderHistoryId = oh.Id
	 
	GROUP BY OH.ID, OH.ERPOrderNumber
print '11 ' + convert(varchar(25), getdate() ,121)

	--*******************************************************************************************************************
	-- Creating custom properties for the Company Name field 
	--*******************************************************************************************************************
	
	--TRUNCATE THE EXISTING RECORDS FOR COMPANY NAME CUSTOMER PROPERTY
	DELETE FROM [dbo].[CustomProperty]
	WHERE Name = 'CompanyName';
print '12 ' + convert(varchar(25), getdate() ,121)		

	-- Company Name same for master and child levels
	INSERT INTO [dbo].[CustomProperty]
		([Id]
		,[ParentId]
		,[Name]
		,[Value]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT NEWID() ID,
		oh.id ParentId, 
		'CompanyName' Name, 
		MAX(COALESCE(C.CompanyName, C2.CustomerName, '')) Value,
		GETDATE() [CreatedOn], 
		@User [CreatedBy], 
		GETDATE() [ModifiedOn], 
		@User [ModifiedBy]
	FROM OrderHistory oh (NOLOCK)
	LEFT JOIN orderhistoryline ohl (NOLOCK) on ohl.orderhistoryid = oh.id
	LEFT JOIN Customer C (NOLOCK) ON C.CustomerNumber = oh.CustomerNumber and C.CustomerSequence = oh.CustomerSequence
	LEFT JOIN DM_ECommerce.dbo.Customer c2 (NOLOCK) ON c2.CustomerNo = oh.CustomerSequence
	GROUP BY oh.id
print '13 ' + convert(varchar(25), getdate() ,121)

	--*******************************************************************************************************************
	-- Creating custom properties for the Order Generation Count field 
	--*******************************************************************************************************************
	--TRUNCATE THE EXISTING RECORDS FOR Order Generation Count CUSTOMER PROPERTY
	DELETE FROM [dbo].[CustomProperty]
	WHERE Name = 'GenerationCount';

	INSERT INTO [dbo].[CustomProperty]
				([Id]
				,[ParentId]
				,[Name]
				,[Value]
				,[CreatedOn]
				,[CreatedBy]
				,[ModifiedOn]
				,[ModifiedBy])
	SELECT 
		NEWID() Id
		, OH.Id ParentId
		, 'GenerationCount' Name
		, OH.GenerationCount Value
		, GetDate() CreatedOn
		, @User CreatedBy
		, GetDate() ModifiedOn
		, @User ModifiedBy
	FROM OrderHistory OH (NOLOCK)
	WHERE OH.ERPOrderNumber not like '%.%' OR GenerationCount = 1 
print '14 ' + convert(varchar(25), getdate() ,121)

	--*******************************************************************************************************************
	-- Creating custom properties for the InvoiceDate field 
	--*******************************************************************************************************************
	--TRUNCATE THE EXISTING RECORDS FOR Order Invoice Date CUSTOMER PROPERTY
	DELETE FROM [dbo].[CustomProperty]
	WHERE Name = 'InvoiceDate';

	INSERT INTO [dbo].[CustomProperty]
				([Id]
				,[ParentId]
				,[Name]
				,[Value]
				,[CreatedOn]
				,[CreatedBy]
				,[ModifiedOn]
				,[ModifiedBy])
	SELECT 
		NEWID() Id
		, OH.Id ParentId
		, 'InvoiceDate' Name
		,convert(nvarchar(10),OH.InvoiceDate, 120) Value
		, GetDate() CreatedOn
		, @User CreatedBy
		, GetDate() ModifiedOn
		, @User ModifiedBy
	FROM OrderHistory OH (NOLOCK)
	WHERE OH.InvoiceDate IS NOT NULL
print '15 ' + convert(varchar(25), getdate() ,121)

	--**************************************************************************************************************************
	--Update the existing IDs
	--**************************************************************************************************************************
	UPDATE ECP SET ECP.Id = ICP.Id 
	FROM CustomProperty ECP 
	JOIN [Insite.Morsco]..CustomProperty ICP (NOLOCK)
	ON ECP.ParentId = ICP.ParentId 
	AND ECP.Name = ICP.Name 
print '15 ' + convert(varchar(25), getdate() ,121)	

END