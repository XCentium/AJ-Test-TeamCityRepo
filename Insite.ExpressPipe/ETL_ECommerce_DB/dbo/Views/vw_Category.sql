
















CREATE VIEW [dbo].[vw_Category] AS

	WITH c1 AS
	(
		SELECT DISTINCT
			--Temporarily commenting as Insite ECommerce only supports two levels.. 
			--Using Level3 and Level5
			--Later needs to use it when needed 
			[dbo].[fn_ScrubData](CommodityCodeDescriptionLevel1) Level1,
			[dbo].[fn_ScrubData](CommodityCodeDescriptionLevel2) Level2,
			[dbo].[fn_ScrubData](CommodityCodeDescriptionLevel3) Level3,
			[dbo].[fn_ScrubData](CommodityCodeDescriptionLevel4) Level4,
			[dbo].[fn_ScrubData](CommodityCodeDescriptionLevel5) Level5
		FROM TradeServicesProduct
	)
	

		SELECT 
			0 Level,

			'' ParentPath, 
			Level1 Path, 
			Level1 CategoryName,
			[dbo].[fn_UrlEncode](Level1) URLSegment 
		FROM C1 WHERE iSNULL(Level1,'') <> ''
	UNION 
		SELECT 
			1 Level, 
			Level1 ParentPath, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END Path, 
			Level2 CategoryName,
			[dbo].[fn_UrlEncode](Level2) URLSegment  
		FROM C1 WHERE ISNULL(Level2,'') <> ''
	UNION 
		SELECT 
			2 Level, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END 
				     ParentPath, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END +
				     CASE WHEN ISNULL(Level3,'') = '' THEN '' ELSE '|' + Level3 END 
					 Path, 
			Level3 CategoryName,
			[dbo].[fn_UrlEncode](Level3) URLSegment 
		FROM C1 WHERE ISNULL(Level3,'') <> ''
	UNION 
		SELECT 
			3 Level,
			
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END +
					 CASE WHEN ISNULL(Level3,'') = '' THEN '' ELSE '|' + Level3 END 
					 ParentPath, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END +
					 CASE WHEN ISNULL(Level3,'') = '' THEN '' ELSE '|' + Level3 END +
					 CASE WHEN ISNULL(Level4,'') = '' THEN '' ELSE '|' + Level4 END 
					 Path, 
			Level4 CategoryName,
			[dbo].[fn_UrlEncode](Level4) URLSegment 
		FROM C1 WHERE ISNULL(Level4,'') <> ''
	UNION 
		SELECT 
			4 Level, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END +
					 CASE WHEN ISNULL(Level3,'') = '' THEN '' ELSE '|' + Level3 END +
					 CASE WHEN ISNULL(Level4,'') = '' THEN '' ELSE '|' + Level4 END
					 ParentPath, 
			Level1 + CASE WHEN ISNULL(Level2,'') = '' THEN '' ELSE '|' + Level2 END +
					 CASE WHEN ISNULL(Level3,'') = '' THEN '' ELSE '|' + Level3 END +
					 CASE WHEN ISNULL(Level4,'') = '' THEN '' ELSE '|' + Level4 END +
					 CASE WHEN ISNULL(Level5,'') = '' THEN '' ELSE '|' + Level5 END
					 Path, 
			Level5 CategoryName,
			[dbo].[fn_UrlEncode](Level5) URLSegment 
		FROM C1 WHERE iSNULL(Level5,'') <> ''