
CREATE PROCEDURE [dbo].[sp_PopulateOrderLogData]
(
	@UserName VARCHAR(50)
)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateOrderLog]
-- Descr:	Creates Order Header Detail Log data from Scrub table
-- Created:	1/26/2016 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateOrderLog] 'ServiceUser'
--*****************************************************************************************************************
BEGIN
		SET NOCOUNT ON;

		SET XACT_ABORT ON;

	DECLARE @NewActivityInstanceId UNIQUEIDENTIFIER = NEWID();

	INSERT INTO [dbo].[ActivityInstance]
		([ActivityInstanceId]
		,[ActivityName]
		,[StartDatetime])
	VALUES
		(@NewActivityInstanceId
		,'CreateOrderHeaderDetailLog'
		,GETDATE())

	-- Add Order Header Scrub data to Order Header Log table
	INSERT [dbo].[OrderHeaderLog]
        ([Id]
        ,[ActivityInstanceId]
        ,[OrderNo]
        ,[Generation]
        ,[OrderStatus]
        ,[InvoiceNo]
        ,[InvoiceDate]
        ,[OrderDate]
        ,[RequireDate]
        ,[ShipDate]
        ,[BillToID]
        ,[BillTo]
        ,[ShipToID]
        ,[ShipTo]
        ,[ShippingAddress1]
        ,[ShippingAddress2]
        ,[City]
        ,[State]
        ,[Zip]
        ,[Phone]
        ,[PriceBranch]
        ,[ShipBranch]
        ,[CustomerPO]
        ,[OrderBy]
        ,[ReleaseNo]
        ,[Salesperson]
        ,[Writer]
        ,[ShipVia]
        ,[TaxJurisdiction]
        ,[QuoteID]
        ,[Terms]
        ,[Freight]
        ,[Handling]
        ,[Tax]
        ,[FET]
        ,[ServiceChrg]
        ,[Total]
        ,[DueDate]
        ,[CashDisc]
        ,[WebDisc]
        ,[DiscAmt]
        ,[DiscDate]
        ,[DiscTaken]
        ,[Deposit]
        ,[AmtPaid]
        ,[ShippingInstr]
        ,[InternalNotes]
        ,[ShippingInstrLines]
        ,[InternalNotesLines]
        ,[LastUpdate]
        ,[LastUpdateTime]
        ,[LastUpdateUser]
        ,[LastUpdateComments]
        ,[CreatedOn]
        ,[CreatedBy]
        ,[ModifiedOn]
        ,[ModifiedBy])
	SELECT 
		NEWID() ID
		,@NewActivityInstanceId ActivityInstanceId
		,[OrderNo]
		,[Generation]
		,[Order_Status]
		,[Invoice_No]
		,[Invoice_Date]
		,[Order_Date]
		,[Require_Date]
		,[Ship_Date]
		,[BillTo_ID]
		,[BillTo]
		,[ShipTo_ID]
		,[ShipTo]
		,[Shipping_Address1]
		,[Shipping_Address2]
		,[City]
		,[State]
		,[Zip]
		,[Phone]
		,[Price_Branch]
		,[Ship_Branch]
		,[Customer_PO]
		,[Order_By]
		,[Release_No]
		,[Salesperson]
		,[Writer]
		,[Ship_Via]
		,[Tax_Jurisdiction]
		,[Quote_ID]
		,[Terms]
		,[Freight]
		,[Handling]
		,[Tax]
		,[FET]
		,[Service_Chrg]
		,[Total]
		,[Due_Date]
		,[Cash_Disc]
		,[Web_Disc]
		,[Disc_Amt]
		,[Disc_Date]
		,[Disc_Taken]
		,[Deposit]
		,[Amt_Paid]
		,[Shipping_Instr]
		,[Internal_Notes]
		,[Shipping_Instr_Lines]
		,[Internal_Notes_Lines]
		,[Last_Update]
		,[Last_Update_Time]
		,[Last_Update_User]
		,[Last_Update_Comments]
		,GetDate() CreatedOn
		,@UserName CreatedBy
		,GetDate() ModifiedOn
		,@UserName ModifiedBy
	FROM [dbo].[OrderHeaderScrub]

	--Adding Order Deails scrub data to Order Details Log
	--SET @NewActivityInstanceId = 'C8B330B7-2A73-4C57-A354-38708C7ADC90'

	INSERT INTO [dbo].[OrderDetailLog]
		([Id]
		,[OrderHeaderId]
		,[ActivityInstanceId]
		,[OrderNo]
		,[Generation]
		,[ItemCode]
		,[Description]
		,[LineItemID]
		,[ProductID]
		,[PdwID]
		,[Desc_As_Stored]
		,[UPC]
		,[OrderQty]
		,[SellUnit]
		,[SellUnitQty]
		,[UnitPrice]
		,[ShipQty]
		,[ShipQtyAlpha]
		,[BaseShipQty]
		,[BaseUnit]
		,[ItemReleaseNo]
		,[SerialNumbers]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT 
		NEWID() Id
		,OH.Id OrderHeaderId
		,@NewActivityInstanceId ActivityInstanceId
		,OD.[OrderNo]
		,OD.[Generation]
		,[Item_Code]
		,[Description]
		,[Line_Item_ID]
		,[Product_ID]
		,[PDW_ID]
		,[Desc_As_Stored]
		,[UPC]
		,[Order_Qty]
		,[Sell_Unit]
		,[Sell_Unit_Qty]
		,[Unit_Price]
		,[Ship_Qty]
		,[Ship_Qty_Alpha]
		,[Base_Ship_Qty]
		,[Base_Unit]
		,[Item_Release_No]
		,[Serial_Numbers]
		,GetDate() CreatedOn
		,@UserName CreatedBy
		,GetDate() ModifiedOn
		,@UserName ModifiedBy
	FROM [dbo].[OrderDetailScrub] OD
	JOIN OrderHeaderLog OH ON OH.OrderNo = OD.OrderNo 
							AND OH.Generation = OD.Generation
	WHERE OH.ActivityInstanceId = @NewActivityInstanceId
END