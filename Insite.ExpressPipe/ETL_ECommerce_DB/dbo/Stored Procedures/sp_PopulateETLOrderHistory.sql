CREATE PROCEDURE [dbo].[sp_PopulateETLOrderHistory]
--
-- Name:	sp_PopulateETLOrderHistory
-- Descr:	Populate ETL Order History and Order History Line
-- Created:	7/28/2015 Matt Glover XCentium
-- Altered:
-- Test With: exec sp_PopulateETLOrderHistory 'EXP', 'ServiceUser'
(
	@EtlSourceID VARCHAR(5),
	@User VARCHAR(100)
)
AS 
BEGIN
	SET NOCOUNT ON;
	SET ANSI_WARNINGS OFF;
	
	DECLARE @SentinelDate DATETIME2 = '1900-01-01';
	DECLARE @ErrorMessage VARCHAR(100);

	--==========================================================================================================
	-- Delete current tables
	--==========================================================================================================
		
	-- Turn off foreign key constraints so we can delete
	ALTER TABLE OrderHistoryLine NOCHECK CONSTRAINT all
	ALTER TABLE OrderHistory NOCHECK CONSTRAINT all

	--If we can truncate, they're not logged, so transaction should not help
	TRUNCATE TABLE OrderHistoryLine
	DELETE OrderHistory

	-- Turn ON foreign key constraints so we can truncate
	ALTER TABLE OrderHistoryLine CHECK CONSTRAINT all
	ALTER TABLE OrderHistory CHECK CONSTRAINT all

	-- TODO: What statuses should we be loading.

	BEGIN TRY
		BEGIN TRANSACTION
				
			--==========================================================================================================
			-- Insert OrderHistoryLine
			--==========================================================================================================
		
			-- Some fields (like address and name) need consistent information from a single row.  We'll use the lowest generation row
			-- That's what these first 2 CTEs do
		
			;WITH DupOrder AS
			(
				SELECT ROW_NUMBER() OVER (Partition By ERPOrderNo ORDER BY GenId) [Row],
					H.*
				 FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H
				 WHERE ETLSourceID = @ETLSourceId
			),
			FirstGenOrder AS
			(
				SELECT *
				FROM DupOrder
				WHERE [Row] = 1
			),
			-- This CTE is everything that needs to roll up, except OrderStatus
			SummarizedOrder AS
			(
				SELECT
					H.ERPOrderNo,
					SUM(H.FreightOut) FreightOut,
					SUM(H.HandlingOut) HandlingOut,
					SUM(H.ExpFreightOut) ExpFreightOut,
					SUM(H.ExpHandlingOut) ExpHandlingOut,
					SUM(H.OrderSubTotal) OrderSubTotal,
					SUM(H.TotalDiscount) TotalDiscount,
					--TODO: Leaving this out, unless we need it.  Currently is Varchar(1)
					-- SUM(H.TotalFreightAndHandling) TotalFreightAndHandling,
					SUM(H.TotalTax) TotalTax,
					SUM(H.OrderTotalAmount) OrderTotalAmount,
					-- Makes a comma-separated list of the distinct OrderStatus values for all generations.
					REPLACE(
						(
							SELECT ',' + H2.OrderStatus AS 'data()'
							FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H2
							WHERE H2.ERPOrderNo = H.ERPORderNo
							GROUP BY H2.OrderStatus
							FOR XML PATH('')
						) + ','
					, ' ', '') OrderStatuses,
					--Same thing for order type
					REPLACE(
						(
							SELECT ',' + H2.OrderType AS 'data()'
							FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H2
							WHERE H2.ERPOrderNo = H.ERPORderNo
							GROUP BY H2.OrderType
							FOR XML PATH('')
						) + ','
					, ' ', '') OrderTypes
				FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H
				WHERE ETLSourceID = @ETLSourceId
				GROUP BY ERPOrderNo
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
			   --,[ShippingAndHandling]
			   ,[OtherCharges]
			   ,[TaxAmount]
			   ,[OrderTotal]
			   ,[ModifiedOn]
			   ,[ConversionRate]
			   ,[CreatedOn]
			   ,[CreatedBy]
			   ,[ModifiedBy])
			SELECT
			   O1.[ERPOrderNo],
			   '' [WebOrderNumber],								--TODO: Set from chosen field
			   ISNULL(O1.[OrderDate],@SentinelDate) [OrderDate],
			   ISNULL(O1.OrderStatus,'') [Status],
			   ISNULL(O1.BillToNo,'') [CustomerNumber],
			   ISNULL(O1.GenId,0) [CustomerSequence],
			   ISNULL(O1.CustomerPoNo, '') [CustomerPO],
			   'USD' [CurrencyCode],							--TODO: Check
			   ISNULL(O1.TermsCode,'') [Terms],
			   '' [ShipCode],
			   '' [Salesperson],								--TODO
			   ISNULL(O1.BillToName,'') [BTCompanyName],
			   ISNULL(O1.BillToAddressLine1,'') [BTAddress1],
			   ISNULL(O1.BillToAddressLine2,'')  [BTAddress2],
			   ISNULL(O1.BillToAddressCity,'') [BTCity],
			   ISNULL(O1.BillToAddressState,'') [BTState],
			   ISNULL(O1.BillToAddressPostalCode,'') [BTPostalCode],
			   'US' [BTCountry],								-- TODO: Check
			   ISNULL(O1.ShipToAddressLine1,'') [ShipToAddress1],
			   ISNULL(O1.ShipToAddressLine1,'') [ShipToAddress2],
			   ISNULL(O1.ShipToName,'') [STCompanyName],
			   ISNULL(O1.ShipToCity,'') [STCity],
			   ISNULL(O1.ShipToState,'') [STState],
			   ISNULL(O1.ShipToPostalCode,'') [STPostalCode],
			   'US' [STCountry],								-- TODO: Check
			   '' [Notes],
			   O2.OrderSubTotal [ProductTotal],
			   O2.TotalDiscount [DiscountAmount],
			   --O1.TotalFreightAndHandling [ShippingAndHandling], NOTE: Not currently using and it's a varchar
			   0 [OtherCharges],
			   O2.TotalTax [TaxAmount],
			   O2.OrderTotalAmount [OrderTotal],
			   GETDATE() [ModifiedOn],
			   0 [ConversionRate],								-- TODO: Make sure this is not an issue later
			   GETDATE() [CreatedOn],
			   @User [CreatedBy],
			   @User [ModifiedBy]
			FROM FirstGenOrder O1
			JOIN SummarizedOrder O2 ON O2.ERPOrderNo = O1.ERPOrderNo

			-- Get the IDs to be used in Merging
			UPDATE New
				SET New.ID = Existing.ID
			FROM OrderHistory New
			JOIN [Insite.ExpressPipe]..OrderHistory Existing ON Existing.ErpOrderNumber = New.ERPOrderNumber

			--==========================================================================================================
			-- Insert OrderHistoryLine
			--==========================================================================================================
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
			   MAX(OH.Id) [OrderHistoryId],
			   NULL [RequiredDate],
			   NULL [LastShipDate],
			   MAX(OH.CustomerNumber) [CustomerNumber],
			   '' [CustomerSequence],				-- Multiple Generations, Lines, Statuses
			   '' [LineType],
			   '' [Status],							--TODO: Don't have requirements for this.  Will probably change
			   ISNULL(I.LineNum,0)  [LineNumber], --TODO ***************Conversion issue needs to be fixed****************
			   0 [ReleaseNumber],
			   ISNULL(I.ERPPartNo,'') [ProductERPNumber],
			   '' [CustomerProductNumber],
			   '' [LinePOReference],
			   ISNULL(MAX(I.ErpPartName),'') [Description],
			   '' [Warehouse],						-- May have multiple warehouses
			   '' [Notes],
			   SUM(I.OrderQuantity) [QtyOrdered],
			   SUM(CASE WHEN H.ShipDate IS NOT NULL THEN I.OrderQuantity ELSE 0 END) [QtyShipped], -- TODO: Validate this approach
			   '' [UnitOfMeasure],
			   0 [InventoryQtyOrdered],
			   0 [InventoryQtyShipped],
			   ISNULL(MAX(I.UnitPrice),0) [UnitPrice],
			   0 [DiscountPercent],
			   0 [DiscountAmount],
			   0 [PromotionAmountApplied],
			   ISNULL(SUM(I.OrderQuantity * I.UnitPrice), 0) [LineTotal],
			   0 [RMAQtyRequested],
			   0 [RMAQtyReceived],
			   GETDATE() [CreatedOn],
			   'MyServiceUser' [CreatedBy],
			   GETDATE() [ModifiedOn],
			   'MyServiceUser' [ModifiedBy]
			FROM DM_ECommerce.dbo.vw_AllSalesLedgerHeaders H
			JOIN DM_ECommerce.dbo.LedgerLineItem I (NOLOCK) ON I.ETLSourceId = H.EtlSourceID
											AND I.ERPOrderNo = H.ERPOrderNo
											AND ISNULL(I.Gen,'') = ISNULL(H.Gen,'')
											AND ISNULL(I.GenID,'')  = ISNULL(H.GenId,'')
			JOIN OrderHistory OH ON OH.ERPOrderNumber = H.ErpOrderNo
			WHERE I.ETLSourceID = 'EXP'--@EtlSourceId
			AND I.ERPPartno IS NOT NULL
			GROUP BY I.ERPOrderNo, I.ErpPartNo, I.LineNum

			-- Get the IDs to be used in Merging
			UPDATE New
				SET New.ID = Existing.ID
			FROM OrderHistoryLine New
			JOIN [Insite.ExpressPipe]..OrderHistoryLine Existing ON Existing.OrderHistoryId = New.OrderHistoryId
															   AND Existing.ProductERPNumber = New.ProductERPNumber
															   AND Existing.LineNumber = New.LineNumber

		COMMIT TRANSACTION;
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK
	END Catch;
END


--TRUNCATE TABLE OrderHistoryLine