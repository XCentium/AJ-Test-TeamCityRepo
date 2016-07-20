




CREATE VIEW [dbo].[vw_QualifyingBillToCustomers]
AS
	  SELECT DISTINCT 
		 C.* 
	FROM [DM_ECommerce]..[Customer] C
	JOIN [dbo].[vw_QualifyingOrders] QO 
	  ON (C.[CustomerNo] = QO.[BillToNo])
	 AND C.ETLSourceId = QO.ETLSourceId
	 AND C.[ExcludeFromIndex] = 0