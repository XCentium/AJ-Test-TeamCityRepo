












CREATE VIEW [dbo].[vw_CategoryProduct] AS

	WITH CTE_Category AS
	(
		SELECT C1.Id, C1.ShortDescription From Category C1 
		LEFT JOIN Category C2 ON C1.Id = C2.ParentId
		WHERE C2.ParentId IS NULL
	),
	CTE_TSP AS
	(
		SELECT TSP.CustomerItemId, 
			CASE WHEN TSP.CommodityCodeDescriptionLevel5 <> '' THEN TSP.CommodityCodeDescriptionLevel5 
				 WHEN TSP.CommodityCodeDescriptionLevel4 <> '' THEN TSP.CommodityCodeDescriptionLevel4 
				 WHEN TSP.CommodityCodeDescriptionLevel3 <> '' THEN TSP.CommodityCodeDescriptionLevel3 
				 WHEN TSP.CommodityCodeDescriptionLevel2 <> '' THEN TSP.CommodityCodeDescriptionLevel2 
				 ELSE TSP.CommodityCodeDescriptionLevel1 END CategoryName
		FROM TradeServicesProduct TSP
	)SELECT DISTINCT
			 c.id			as CategoryId,
			 p.id			as ProductId,
			 T.CategoryName as Category,
			 0				as SortOrder
	FROM [Product] P 
	JOIN CTE_TSP T ON P.ERPNumber = T.CustomerItemId
	JOIN CTE_Category c ON c.ShortDescription = T.CategoryName;