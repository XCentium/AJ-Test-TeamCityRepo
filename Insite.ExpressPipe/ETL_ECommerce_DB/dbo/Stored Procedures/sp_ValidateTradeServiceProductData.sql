CREATE PROCEDURE [dbo].[sp_ValidateTradeServiceProductData]
AS
--*****************************************************************************************************************
-- Name:	[sp_ValidateTradeServiceProductData]
-- Descr:	Executes all the misc data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_ValidateTradeServiceProductData]
--*****************************************************************************************************************
BEGIN
	DECLARE @NL NVARCHAR(2) = CHAR(13)
	DECLARE @SQL NVARCHAR(MAX) = ''
	DECLARE @ErrorMsg VARCHAR(MAX) = ''
	DECLARE @ErrorCount int ;
	
	--Checking for product record duplicates
	;WITH CTE AS 
	(SELECT [TS_ID],
			[CUSTOMER_UPC],
			[CUSTOMER_Status],
			[UPC],
			[UNSPSC], 
			[CUSTOMER_Item ID],
			[ITEM WEIGHT (pounds)],
			[PACKAGE WEIGHT (pounds)],
			[PACKAGE WIDTH (inch)],
			[PACKAGE LENGTH (inch)],
			[PACKAGE HEIGHT (inch)],
			[PACKAGE VOLUME (cubic inch)] 
		FROM TradeServicesProduct_Scrub
		WHERE ((ISNULL([UPC],'') <>'' AND ISNUMERIC([UPC]) <> 1 ) OR 
		(ISNULL([UNSPSC],'') <>'' AND ISNUMERIC([UNSPSC]) <> 1 ) OR 
		(ISNULL([ITEM WEIGHT (pounds)],'') <>'' AND ISNUMERIC([ITEM WEIGHT (pounds)]) <> 1) OR 
		(ISNULL([PACKAGE WEIGHT (pounds)],'') <>'' AND ISNUMERIC([PACKAGE WEIGHT (pounds)]) <> 1 ) OR 
		(ISNULL([PACKAGE WIDTH (inch)],'') <>'' AND ISNUMERIC([PACKAGE WIDTH (inch)]) <> 1) OR 
		(ISNULL([PACKAGE LENGTH (inch)],'') <>'' AND ISNUMERIC([PACKAGE LENGTH (inch)]) <> 1 ) OR 
		(ISNULL([PACKAGE HEIGHT (inch)],'') <>'' AND ISNUMERIC([PACKAGE HEIGHT (inch)]) <> 1 ) OR
		(ISNULL([PACKAGE VOLUME (cubic inch)],'') <>'' AND ISNUMERIC([PACKAGE VOLUME (cubic inch)]) <> 1))
		)SELECT @ErrorCount = COUNT(*) from CTE;

    IF(@ErrorCount > 0) 
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'There are ' + CAST(@ErrorCount as VARCHAR(10)) + ' rows in the files Trade Services Product file having non-numeric characters in the numeric columns.' + @NL
	END

	IF(@ErrorMsg <> '')

	BEGIN 
		RAISERROR(@ErrorMsg,11,1); 
	END
	

END