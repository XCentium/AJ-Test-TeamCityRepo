
CREATE VIEW [dbo].[vw_NonTSPProductProperty]
AS
    SELECT [ERPNumber] ERPPartNo, 'ManufacturerName' Name, MAX(ManufacturerName) Value 
	FROM vw_NonTradeServiceProductData WHERE ISNULL(ManufacturerName, '') <> '' GROUP BY [ERPNumber]
    UNION 
	SELECT [ERPNumber] ERPPartNo, 'Stock' Name, CASE WHEN MAX([Stock_NonStock]) = 'STOCK' THEN 'YES' ELSE 'NO' END Value 
	FROM vw_NonTradeServiceProductData WHERE ISNULL([Stock_NonStock], '') <> '' GROUP BY [ERPNumber]
	UNION
	SELECT [ERPNumber] ERPPartNo, 'GenericPartNumber' Name, GenericSKU Value 
	FROM vw_NonTradeServiceProductData LEFT JOIN GenericProducts ON ERPNumber = CustomerItemId
	WHERE ISNULL(GenericSKU, '') <> ''
	UNION 
	SELECT [ERPNumber] ERPPartNo, 'IsNonTSP' Name, 'Yes' Value FROM vw_NonTradeServiceProductData