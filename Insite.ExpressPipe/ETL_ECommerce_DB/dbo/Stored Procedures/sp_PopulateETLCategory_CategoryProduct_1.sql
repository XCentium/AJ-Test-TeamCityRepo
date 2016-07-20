

CREATE PROCEDURE [dbo].[sp_PopulateETLCategory_CategoryProduct]
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
	DECLARE @DefaultCategoryID uniqueidentifier = NEWID();

	
	SET XACT_ABORT ON;

		SELECT @WebSiteId = dbo.fn_WebSiteForEtlSourceID(@EtlSourceId);

		IF @WebSiteId IS NULL
		BEGIN
			SET @ErrorMessage = 'No website found for Etl Source Id ' + @EtlSourceId;
			THROW 60000, @ErrorMessage,  1;
		END

		--*******************************************************************************************************************************
		--TABLE CATEGORY
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
			,[DocumentManagerId]
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
			ISNULL(@WebSiteId,'') WebSiteId,
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
			NULL ContentManagerId,
			NULL DocumentManagerId,
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
			FROM dbo.vw_Category C;

		--*******************************************************************************************************************************
		-- Add a DEFAULT category for Non Trade Service Products 
		-- which will have all the Non Trade Service Products assigned and will invisible to the users
		--*******************************************************************************************************************************
		INSERT [dbo].[Category] ([Id], [ParentId], [WebSiteId], [Name], [ShortDescription], [SmallImagePath], [LargeImagePath], 
		[ActivateOn], [DeactivateOn], [UrlSegment], [MetaKeywords], [MetaDescription], [SortOrder], [ShowDetail], 
		[PageTitle], [ContentManagerId], [DocumentManagerId], [ERPProductValues], [IsFeatured], [IsDynamic], 
		[RuleManagerId], [ImageAltText], [CreatedOn], [CreatedBy], [ModifiedOn], [ModifiedBy], [Path], [ParentPath]) 
		VALUES (@DefaultCategoryID, NULL, @WebSiteId, N'Default', N'Default', N'', N'', 
		getdate(), NULL, N'Default', N'', N'', 
		0, 1, N'Default', NULL, NULL, 
		N'', 0, 0, NULL, N'Default', 
		getdate(), @UserName, getdate(), @UserName, N'Default', N'')
		--*******************************************************************************************************************************

		-- Grab IDs from existing categories from Insite
		;WITH CTE AS
		(
			SELECT 
				CAST('' AS NVARCHAR(255)) Parent,
				C.Id,
				C.ParentId,
				C.Name
			FROM [Insite.Morsco]..Category c (NOLOCK)
			WHERE ParentId IS NULL
			UNION ALL SELECT 
				--CAST(C0.Parent + N'|' + C0.Name AS NVARCHAR(255)) Parent,
				Cast([dbo].[fn_GetCategoryFullPathInsite](C.ParentId) as nvarchar(255)) Parent,
				C.Id,
				C0.ParentID,
				C.Name
			FROM [Insite.Morsco]..Category c (NOLOCK)
			JOIN CTE C0 ON C0.Id = c.ParentId
		)

		UPDATE Category
		SET 
			ID = c1.ID,
			ParentId = c2.ID		--SELECT *
		FROM CTE
		--JOIN Category C ON C.Path =   CASE WHEN CTE.ParentId IS NOT NULL THEN SUBSTRING(CTE.Parent,2,len(CTE.Parent))  + '|' ELSE '' END + CTE.Name
		JOIN [Insite.Morsco]..Category c1 (NOLOCK) ON C1.ID = CTE.ID
		JOIN Category C ON C.Path =  [dbo].[fn_GetCategoryFullPathInsite](C1.Id)
		LEFT OUTER JOIN [Insite.Morsco]..Category c2 (NOLOCK) ON C2.ID = CTE.ParentId

		-- Update the remaining parentIDs
		UPDATE C
		SET C.ParentID = C1.Id
		--SELECT C.ParentID,  C1.Id, C.ParentPath
		FROM Category C (NOLOCK) 
		JOIN Category C1 (NOLOCK) ON C1.Path = C.ParentPath
		--JOIN Category C1 ON [dbo].[fn_GetCategoryFullPathETL](C1.Id) = [dbo].[fn_GetCategoryFullPathETL](C.ParentId)
		WHERE C.ParentID IS NULL
		AND C.ParentPath <> ''
		--AND [dbo].[fn_GetCategoryFullPathETL](C.ParentId) <> ''

		
		--*******************************************************************************************************************************
		-- Update Category small image with the first associated product's small image 
		--*******************************************************************************************************************************
		;WITH CTE AS
		(SELECT cat.id			as CategoryId,
				MAX(p.SmallImagePath) as [SmallImagePath]
				FROM [Product] P (NOLOCK) 
			INNER JOIN [TradeServicesProduct] TSP (NOLOCK) ON P.Name  = TSP.CustomerItemID
			INNER JOIN [Category] cat (NOLOCK) ON (   cat.ShortDescription = TSP.CommodityCodeDescriptionLevel1
										OR cat.ShortDescription = TSP.CommodityCodeDescriptionLevel2
										OR cat.ShortDescription = TSP.CommodityCodeDescriptionLevel3
										OR cat.ShortDescription = TSP.CommodityCodeDescriptionLevel4
										OR cat.ShortDescription = TSP.CommodityCodeDescriptionLevel5
				) WHERE ISNULL(P.SmallImagePath,'') <> '' group by Cat.Id
		) Update Cat1 SET cat1.[SmallImagePath] = CTE.[SmallImagePath]
			FROM Category Cat1 (NOLOCK) join CTE On CTE.CategoryId = Cat1.Id

		--*******************************************************************************************************************************

		--*******************************************************************************************************************************
		-- Populate CategoryProperty with category data for the LongDescription 
		--*******************************************************************************************************************************
		DELETE FROM [dbo].[CategoryProperty] WHERE Name = 'LongDescription';

		INSERT INTO [dbo].[CategoryProperty]
				   ([Id]
				   ,[CategoryId]
				   ,[Name]
				   ,[Value]
				   ,[CreatedOn]
				   ,[CreatedBy]
				   ,[ModifiedOn]
				   ,[ModifiedBy])
			SELECT 
					NewId() Id
					,Cat.Id CategoryId
					,'LongDescription' Name
					,Cat.Name + 
					' Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
					Aenean commodo ligula eget dolor. Aenean massa. Cum sociis 
					natoque penatibus et magnis dis parturient montes, nascetur 
					ridiculus mus. Donec quam felis, ultricies nec, pellentesque 
					eu, pretium quis, sem. Nulla consequat massa quis enim. 
					Donec pede justo, fringilla vel, aliquet nec, vulputate 
					eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis 
					vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt.' Value
					,GetDate() CreatedOn
					,@UserName CreatedBy
					,GetDate() ModifiedBy
					,@UserName ModifiedBy
			  FROM	Category Cat (NOLOCK)

		--*******************************************************************************************************************************

		--*******************************************************************************************************************************
		--TABLE CATEGORY PRODUCT
		--*******************************************************************************************************************************
			TRUNCATE TABLE [dbo].[CategoryProduct];

			INSERT INTO [dbo].[CategoryProduct]
				   (Id
				   ,[CategoryId]
				   ,[ProductId]
				   ,[SortOrder]
				   ,[CreatedOn]
				   ,[CreatedBy]
				   ,[ModifiedOn]
				   ,[ModifiedBy])
		    SELECT 
					NEWID() as Id,
					CategoryId,
					ProductId,
					SortOrder,
					GETDATE() as CreatedOn,
					@UserName as CreatedBy,
					GETDATE() as ModifiedOn,
					@UserName as ModifiedBy
			  FROM  vw_CategoryProduct


		--*******************************************************************************************************************************
		--------------NON TRADE SERVICE PRODUCTS--------
		--*******************************************************************************************************************************
		--Add a category property for Non Trade Service Products
		--*******************************************************************************************************************************
			--*****NOTE: Temporarily commenting NON Trade Services Prodcuts as per client request*****
			Select @DefaultCategoryID = Id from Category where Name = 'Default';

		    INSERT [dbo].[CategoryProduct]
				   (Id
				   ,[CategoryId]
				   ,[ProductId]
				   ,[SortOrder]
				   ,[CreatedOn]
				   ,[CreatedBy]
				   ,[ModifiedOn]
				   ,[ModifiedBy])
		    SELECT 
					NEWID() as Id,
					@DefaultCategoryID,
					P.ID as ProductId,
					0 SortOrder,
					GETDATE() as CreatedOn,
					@UserName as CreatedBy,
					GETDATE() as ModifiedOn,
					@UserName as ModifiedBy
			  FROM Product P (NOLOCK) 
			  INNER JOIN ProductProperty PP (NOLOCK) ON PP.ProductId = P.ID 
			  WHERE PP.Name = 'IsNonTSP' AND PP.Value = 'Yes'
			--*******************************************************************************************************************************

			-- Tap existing Category Product Id from the InsiteExpressPipe CategoryProduct table
			--	and update back to ETL
			  UPDATE ETL_CP
			     SET Id = IXP_CP.Id
			    FROM [Insite.Morsco]..CategoryProduct IXP_CP (NOLOCK)
		  INNER JOIN ETL_ECommerce..CategoryProduct ETL_CP (NOLOCK)
		          ON (IXP_CP.ProductId = ETL_CP.ProductId
				 AND IXP_CP.CategoryId = ETL_CP.CategoryId)
END