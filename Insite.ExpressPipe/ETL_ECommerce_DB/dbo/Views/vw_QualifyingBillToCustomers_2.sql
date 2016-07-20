






CREATE VIEW [dbo].[vw_QualifyingBillToCustomers]
AS
	SELECT DISTINCT 
		 C.* 
	FROM [DM_ECommerce]..[Customer] C
	JOIN [dbo].[vw_QualifyingShipments] QS ON C.[CustomerNo] = QS.[BillToCustomerID] AND C.ETLSourceId = QS.ETLSourceId
    WHERE C.IsBillTo = 1 AND C.[ExcludeFromIndex] = 0