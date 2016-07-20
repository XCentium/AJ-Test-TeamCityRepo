




CREATE VIEW dbo.vw_QualifyingCustomers
AS
	SELECT
		C.* 
	FROM DM_ECommerce..Customer C
	JOIN dbo.vw_QualifyingShipments QS 
	  ON C.ETLSourceId = QS.ETLSourceId
	  AND C.ExcludeFromIndex = 0
	  AND C.CustomerNo = QS.BillToCustomerID
	UNION  
	SELECT
		C.* 
	FROM DM_ECommerce..Customer C
	JOIN dbo.vw_QualifyingShipments QS
	  ON C.ETLSourceId = QS.ETLSourceId
	  AND C.ExcludeFromIndex = 0
	  AND C.CustomerNo = QS.ShipToCustomerID