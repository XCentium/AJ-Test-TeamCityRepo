--=========================================================================================================
--=========================================================================================================
-- Ticket #1339 
-- 1.	Create vw_ProductWebsites which pivots DM_Ecommerce.ProductClass 
--		a.	From a set of columns saying whether or not the product belongs to a website 
--		b.	To an intersect-record format.
--		c.	The intention here is that this view can be extended to include other websites as their catalog data comes available
-- 2.	Modify sp_PopulateETLCategory_CategoryProduct to
--		a.	Load a set of categories for each website
--		b.	Create CategoryProduct 
--			i.	For all websites
--			ii.	Following the new rules
--				1.	Product must be in catalog of website/Opco
--				2.	Products have Trade Services data – or else we don’t know the category

--=========================================================================================================
--=========================================================================================================

USE ETL_ECommerce
GO

--=========================================================================================================
-- Create vw_ProductWebsite to pivot DM_Ecommerce.ProductClass that will have a column per website
-- indicating whether this product belongs in the website's catalog
--=========================================================================================================
IF EXISTS(select * FROM sys.views where name = 'vw_ProductWebsite')
BEGIN
	DROP VIEW dbo.vw_ProductWebsite
END
GO

CREATE VIEW dbo.vw_ProductWebsite 
AS
	SELECT
		WS.ID WebsiteId,
		P.ID ProductID
	FROM [Insite.Morsco]..Website WS
	CROSS JOIN DM_ECommerce..ProductClass PC
	JOIN Product P on P.ERPNumber = PC.ProductID
	JOIN DM_ECommerce..Product EP ON EP.ETLSourceID = PC.ETLSourceID
	                            AND EP.ERPPartNo = PC.ProductID
	WHERE WS.Name = 'ExpressPipe'
	-- If 'Y', this column indicates this product is in the ExpressPipe catalog
	AND ISNULL(PC.ECatalog_EXP ,'') = 'Y'

	-- Example of how to add Morrison to this view, assuming the website name 'Morrison' and the column ECatalog_MOR is what they give us
	-- Matt tested this code (and added the ECatalog_MOR column and some values)

	--UNION ALL

	--SELECT
	--	WS.ID WebsiteId,
	--	P.ID ProductID
	--FROM [Insite.Morsco]..Website WS
	--CROSS JOIN DM_ECommerce..ProductClass PC
	--JOIN Product P on P.ERPNumber = PC.ProductID
	--JOIN DM_ECommerce..Product EP ON EP.ETLSourceID = PC.ETLSourceID
	--                            AND EP.ERPPartNo = PC.ProductID
	--WHERE WS.Name = 'Morrison'
	---- If 'Y', this column indicates this product is in the ExpressPipe catalog
	--AND ISNULL(PC.ECatalog_MOR ,'') = 'Y'
	
GO

--*****************************************************************************************************************
-- VW_CategoryProduct needs to have a website value, too
--*****************************************************************************************************************

ALTER VIEW [dbo].[vw_CategoryProduct] AS

	-- Leaf categories
	WITH CTE_Category AS
	(
		SELECT 
			C1.WebsiteID, 
			C1.Id, 
			C1.ShortDescription,
			C1.Path
		FROM Category C1 
		LEFT JOIN Category C2 ON C1.WebsiteID = C2.WebsiteID
		                     AND C1.Id = C2.ParentId
		WHERE C2.ParentId IS NULL
	),
	-- Trade Service Leaf Categories
	CTE_TSP AS
	(
		SELECT TSP.CustomerItemId, 
			CASE WHEN TSP.CommodityCodeDescriptionLevel5 <> '' THEN TSP.CommodityCodeDescriptionLevel5 
				 WHEN TSP.CommodityCodeDescriptionLevel4 <> '' THEN TSP.CommodityCodeDescriptionLevel4 
				 WHEN TSP.CommodityCodeDescriptionLevel3 <> '' THEN TSP.CommodityCodeDescriptionLevel3 
				 WHEN TSP.CommodityCodeDescriptionLevel2 <> '' THEN TSP.CommodityCodeDescriptionLevel2 
				 ELSE TSP.CommodityCodeDescriptionLevel1 END CategoryName,
			TSP.Fullpath
		FROM TradeServicesProduct TSP
	)
	SELECT
		c.WebSiteId,
		c.id			as CategoryId,
		p.id			as ProductId,
		T.CategoryName as Category,
		0				as SortOrder
	FROM [Product] P 
	JOIN CTE_TSP T ON P.ERPNumber = T.CustomerItemId
	JOIN CTE_Category c ON c.Path = T.FullPath


GO

--=========================================================================================================
-- Modify sp_PopulateETLCategory_CategoryProduct to
--	a.	Load a set of categories for each website
--	b.	Create CategoryProduct 
--		i.	For all websites
--		ii.	Following the new rules
--			1.	Product must be in catalog of website/Opco
--			2.	Products have Trade Services data – or else we don’t know the category
--=========================================================================================================

ALTER PROCEDURE [dbo].[sp_PopulateETLCategory_CategoryProduct]
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLCategory_CategoryProduct]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLCategory_CategoryProduct] 'EXP', 'ServiceUser'
--*****************************************************************************************************************

(
	@ETLSourceID VARCHAR(50),
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @WebSiteId UNIQUEIDENTIFIER = NULL;
	DECLARE @ErrorMessage VARCHAR(100);
	DECLARE @UniqueURLSegment uniqueidentifier = NULL;
	
	SET XACT_ABORT ON;

	--*******************************************************************************************************************************
	-- Build a complete set of categories for each website
	--
	--*******************************************************************************************************************************

	TRUNCATE TABLE Category

	INSERT INTO [dbo].[Category]
		( --ID
		[ParentId]
		,[WebSiteId]
		,[Name]
		,[ShortDescription]
		,[SmallImagePath]
		,[LargeImagePath]
		,[ActivateOn]
		,[DeactivateOn]
		,[UrlSegment]
		,[MetaKeywords]
		,[MetaDescription]
		,[SortOrder]
		,[ShowDetail]
		,[PageTitle]
		,[ContentManagerId]
		,[ERPProductValues]
		,[IsFeatured]
		,[IsDynamic]
		,[RuleManagerId]
		,[ImageAltText]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy]
		,[Path]
		,[ParentPath])
	SELECT
		--NewSequentialID(),
		NULL ParentId,
		W.ID WebsiteId,
		dbo.fn_ScrubData(C.CategoryName) Name,
		dbo.fn_ScrubData(C.CategoryName) ShortDescription,
		'' SmallImagePath,
		'' LargeImagePath,
		GETDATE() ActivateOn,
		NULL DeactivateOn,
		[dbo].[fn_UrlEncode](C.CategoryName) URLSegment,
		'' MetaKeywords,
		'' MetaDescription,
		'' SortOrder,
		1 ShowDetail,
		dbo.fn_ScrubData(C.CategoryName) PageTitle,
		NEWID() ContentManagerId,
		'' ERPProductValues,
		0 IsFeatured,
		0 IsDynamic,
		NULL RuleManagerId,
		dbo.fn_ScrubData(C.CategoryName) ImageAltText,
		GETDATE() CreatedOn,
		@UserName CreatedBy,
		GETDATE() ModifiedOn,
		@UserName ModifiedBy,
		ISNULL(Path,'') Path,
		ISNULL(ParentPath,'') ParentPath
		FROM dbo.vw_Category C
		CROSS JOIN [insite.morsco]..Website W;

	--*******************************************************************************************************************************
	-- Add a DEFAULT category for Non Trade Service Products for each website
	-- which will have all Non Trade Service/Non-Product Catalog Products assigned
	-- We'll make it invisible, but available to search.
	--*******************************************************************************************************************************
	INSERT [dbo].[Category] 
	(
		[Id], 
		[ParentId], 
		[WebSiteId], 
		[Name], 
		[ShortDescription], 
		[SmallImagePath], 
		[LargeImagePath], 
		[ActivateOn], 
		[DeactivateOn], 
		[UrlSegment], 
		[MetaKeywords], 
		[MetaDescription], 
		[SortOrder], 
		[ShowDetail], 
		[PageTitle], 
		[ContentManagerId],  
		[ERPProductValues], 
		[IsFeatured], 
		[IsDynamic], 
		[RuleManagerId], 
		[ImageAltText], 
		[CreatedOn], 
		[CreatedBy], 
		[ModifiedOn], 
		[ModifiedBy], 
		[Path], 
		[ParentPath]
	)
	SELECT 
		NEWID(), 
		NULL, 
		WS.ID WebSiteId, 
		N'Default', 
		N'Default', 
		N'', 
		N'', 
		GETDATE(), 
		NULL, 
		N'Default', 
		N'', 
		N'', 
		0, 
		1, 
		N'Default', 
		NEWID(),  
		N'', 
		0, 
		0, 
		NULL, 
		N'Default', 
		GETDATE(), 
		@UserName, 
		GETDATE(), 
		@UserName, 
		N'Default', 
		N''
		FROM [Insite.Morsco]..Website WS

	-- Grab IDs from existing categories from Insite
	;WITH CTE AS
	(
		SELECT 
			CAST('' AS NVARCHAR(255)) Parent,
			C.Id,
			C.ParentId,
			C.Name,
			C.ContentManagerId
		FROM [Insite.Morsco]..Category c (NOLOCK)
		WHERE ParentId IS NULL
		UNION ALL SELECT 
			Cast([dbo].[fn_GetCategoryFullPathInsite](C.ParentId) as nvarchar(255)) Parent,
			C.Id,
			C0.ParentID,
			C.Name,
			C.ContentManagerId
		FROM [Insite.Morsco]..Category c (NOLOCK)
		JOIN CTE C0 ON C0.Id = c.ParentId
	)
	UPDATE Category
	SET 
		ID = c1.ID,
		ParentId = CTE.ParentID,		
		ContentManagerId = C1.ContentManagerId,
		SmallImagePath = C1.SmallImagePath
	FROM CTE
	JOIN [Insite.Morsco]..Category c1 (NOLOCK) ON C1.ID = CTE.ID
	JOIN Category C ON C.WebSiteID = C1.WebSiteID
	               AND C.Path =  [dbo].[fn_GetCategoryFullPathInsite](C1.Id)

	-- Update the remaining parentIDs
	UPDATE C
	SET C.ParentID = C1.Id
	FROM Category C (NOLOCK) 
	JOIN Category C1 (NOLOCK) ON C1.WebsiteID = C.WebsiteID
	                         AND C1.Path = C.ParentPath
	WHERE C.ParentID IS NULL
	AND C.ParentPath <> ''

	--Create ContentManager records for Categories
	INSERT INTO [dbo].[ContentManager]
        ([Id]
        ,[Name]
        ,[CreatedOn]
        ,[CreatedBy]
        ,[ModifiedOn]
        ,[ModifiedBy])
	SELECT 
		ContentManagerId
		,'Category' 
		,GETDATE()
		,@UserName
		,GETDATE()
		,@UserName
	FROM Category		

	--*******************************************************************************************************************************
	-- Update Category small image from the table CategoryImage which gets updated through SSIS
	--*******************************************************************************************************************************
	--Update missing Category images with most purchased products images in the Category Image table..
	;WITH x AS
	(
		SELECT 
			dbo.[fn_RemoveSpecialCharacters](C.Path) Path, 
			dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath) CIPath, 
			p.smallimagepath, 
			count(*) count, 
			row_number() over (partition by c.path order by count(*) desc) row
		FROM dbo.Category C
		JOIN [Insite.Morsco]..WebSite W ON W.Id = C.WebSiteId
		JOIN CategoryImage CI ON dbo.[fn_RemoveSpecialCharacters](C.Path) = dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath) AND W.Name = CI.WebSiteName
		JOIN CategoryProduct cp on cp.categoryid = c.id
		JOIN Product p on p.id = cp.productid
		WHERE ISNULL(ci.smallimage,'') = ''
		GROUP BY c.path, dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath), p.smallimagepath
	)
	UPDATE CO 
	SET 
		CO.SmallImage = CASE WHEN SmallImagePath != '' THEN SmallImagePath ELSE '/userfiles/images/products/sm_notfound.jpg' END 
	FROM x
	JOIN CategoryImage co on co.CategoryPath = x.Path
	
	--Update rest of the missing Category images with most purchased products images in the Category table..
	;WITH CTE AS
	(
		SELECT 
			C.WebsiteID,
			dbo.[fn_RemoveSpecialCharacters](C.Path) Path, 
			dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath) CIPath, 
			p.smallimagepath, 
			count(*) count, 
			row_number() over (partition by dbo.[fn_RemoveSpecialCharacters](c.path) order by count(*) desc) row
		FROM dbo.Category C
		JOIN [Insite.Morsco]..WebSite W ON W.Id = C.WebSiteId
		JOIN CategoryImage CI ON dbo.[fn_RemoveSpecialCharacters](C.Path) = dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath) AND W.Name = CI.WebSiteName
		JOIN CategoryProduct cp on cp.categoryid = c.id
		JOIN Product p on p.id = cp.productid
		GROUP BY C.WebsiteID, c.path, dbo.[fn_RemoveSpecialCharacters](CI.CategoryPath), p.smallimagepath
	),
	MostUsedImagesByCategory AS
	(
		SELECT
			WebSiteId,
			Path,
			CIPath,
			SmallImagePath,
			[Count],
			Row
		FROM CTE WHERE Row = 1
	),
	CTECategoryImage AS
	(
		SELECT
			WebsiteName,
			dbo.[fn_RemoveSpecialCharacters](C.CategoryPath) Path,
			SmallImage
		FROM CategoryImage C
		WHERE C.CategoryPath IS NOT NULL
	)
	UPDATE C 
	SET 
		C.SmallImagePath = 
			CASE 
				-- Image mentioned for Website & category
				WHEN ISNULL(CIW.SmallImage,'') != '' THEN REPLACE(ISNULL(CIW.SmallImage,''),'http:','https:')
				-- Image mentioned for website
				WHEN ISNULL(CI.SmallImage,'') != '' THEN REPLACE(ISNULL(CI.SmallImage,''),'http:','https:')
				ELSE '/userfiles/images/products/sm_notfound.jpg'
			END
	FROM dbo.Category C
	JOIN [Insite.Morsco]..WebSite WS ON WS.ID = C.WebSiteId
	LEFT JOIN CTECategoryImage CIW ON CIW.WebsiteName = WS.Name
							   AND C.Path = CIW.Path
	LEFT JOIN CTECategoryImage CI ON C.Path = CI.Path
	WHERE ISNULL(C.SmallImagePath,'') IN ('','/userfiles/images/products/sm_notfound.jpg')
	

	--*******************************************************************************************************************************
	-- Populate CategoryProperty with category data for the LongDescription 
	--*******************************************************************************************************************************
	DELETE FROM [dbo].[CustomProperty] 
	WHERE ParentTable = 'Category'
	AND Name = 'LongDescription';

	INSERT INTO [dbo].[CustomProperty]
			([Id]
			,ParentId
			,[Name]
			,[Value]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy],
			ParentTable)
	SELECT 
			NewId() Id
			,C.Id ParentId
			,'LongDescription' Name
			,ISNULL(CI.LongDescription,'') Value
			,GETDATE() CreatedOn
			,@UserName CreatedBy
			,GETDATE() ModifiedBy
			,@UserName ModifiedBy
			,'Category'
		FROM dbo.Category C
	JOIN [Insite.Morsco]..WebSite W ON W.Id = C.WebSiteId
	LEFT JOIN CategoryImage CI ON dbo.[fn_RemoveSpecialCharacters](C.Path) = CI.CategoryPath AND W.Name = CI.WebSiteName
	WHERE CI.CategoryPath is not null

	--*******************************************************************************************************************************
	-- CATEGORY PRODUCT 
	-- Assign catalog products in a given website to their respective categories.
	--*******************************************************************************************************************************
	TRUNCATE TABLE [dbo].[CategoryProduct];

	;WITH CTE_DISTINCT AS
	(
		SELECT DISTINCT
			cp.CategoryID,
			cp.ProductID
		FROM vw_CategoryProduct cp
		JOIN Category c (NOLOCK) ON C.Id = cp.CategoryID
		-- This ensures that the product is in catalog on this website.
		JOIN vw_ProductWebsite pw ON PW.WebSiteId = c.WebSiteId
		                        AND PW.ProductId = CP.ProductId
	)
	INSERT INTO [dbo].[CategoryProduct]
		(Id
		,[CategoryId]
		,[ProductId]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT 
		NEWID() as Id,
		cd.CategoryId,
		cd.ProductId,
		GETDATE() as CreatedOn,
		@UserName as CreatedBy,
		GETDATE() as ModifiedOn,
		@UserName as ModifiedBy
	FROM CTE_DISTINCT cd


	--*******************************************************************************************************************************
	-- Assign products that are either non-catalog or Non-Trade Services to the Default category
	-- This category is hidden on the website
	--*******************************************************************************************************************************
	;WITH CTE_DISTINCT AS
	(
		SELECT DISTINCT
			CD.ID as CategoryId,
			P.ID as ProductId
		FROM [Insite.Morsco]..Website W
		JOIN Category CD on CD.WebsiteID = W.ID 
						and CD.Name = 'Default'
		CROSS JOIN Product P (NOLOCK) 
		LEFT JOIN CategoryProduct cp on cp.productid = p.id
		LEFT JOIN Category C ON C.WebsiteId = W.ID
								AND C.ID = CP.CategoryID
		WHERE C.ID is null
	)
	INSERT [dbo].[CategoryProduct]
		(Id
		,[CategoryId]
		,[ProductId]
		,[CreatedOn]
		,[CreatedBy]
		,[ModifiedOn]
		,[ModifiedBy])
	SELECT 
		NEWID() as Id,
		CD.CategoryId,
		CD.ProductId,
		GETDATE() as CreatedOn,
		@UserName as CreatedBy,
		GETDATE() as ModifiedOn,
		@UserName as ModifiedBy
	FROM CTE_DISTINCT CD


	--*******************************************************************************************************************************
	-- Retrieve existing Category Product Id from the InsiteExpressPipe CategoryProduct table
	--*******************************************************************************************************************************
	UPDATE ETL
	SET ETL.Id = ISC.Id
	FROM [Insite.Morsco]..CategoryProduct ISC (NOLOCK)
	JOIN ETL_ECommerce..CategoryProduct ETL (NOLOCK) ON ISC.ProductId = ETL.ProductId
													AND ISC.CategoryId = ETL.CategoryId

	--*******************************************************************************************************************************
	-- Iteratively remove all categories that don't have products or child categories assigned
	-- (once you remove subcategories, parent category could be eligible, for example)
	--*******************************************************************************************************************************
	DECLARE @RowsRemoved INT = 999999
	-- Guard against endless loop -- Should probably never exceed Max Categories + 1 (for iteration deleting nothing)
	DECLARE @IterationsLeft INT = 6

	WHILE @RowsRemoved > 0 AND @IterationsLeft > 0
	BEGIN

		DELETE C
		FROM Category C
		LEFT JOIN Category Child ON Child.ParentId = C.Id
		LEFT JOIN CategoryProduct CP ON CP.CategoryID = C.ID
		WHERE Child.Id IS NULL
		AND CP.Id IS NULL

		SELECT
			@RowsRemoved = @@ROWCOUNT,
			@IterationsLeft = @IterationsLeft - 1
	END

END

GO
