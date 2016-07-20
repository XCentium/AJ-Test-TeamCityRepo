








CREATE VIEW [dbo].[vw_QualifyingShipToCustomers]
AS
	SELECT DISTINCT 
		 C.* 
	FROM [DM_ECommerce]..[Customer] C
	JOIN [dbo].[vw_QualifyingShipments] QS ON C.[CustomerNo] = QS.[ShipToCustomerID] AND C.ETLSourceId = QS.ETLSourceId
    WHERE C.IsBillTo = 0 AND C.[ExcludeFromIndex] = 0