

CREATE VIEW [dbo].[vw_GetMasterOrdersFromHistory]
AS
	SELECT OH1.*
	FROM OrderHistory oh1
	LEFT JOIN OrderHistory oh2 ON dbo.fn_GetDelimitedElement(oh1.ERPOrderNumber,1,'.') = OH2.ERPOrderNumber + '%'
	WHERE oh1.ERPOrderNumber like '%.%'
	AND oh2.ERPOrderNumber is null
	UNION
	SELECT *
	FROM OrderHistory oh1
	WHERE oh1.ERPOrderNumber not like '%.%'