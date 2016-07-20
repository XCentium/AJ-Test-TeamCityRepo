
CREATE PROCEDURE [dbo].[sp_PopulateETLCategory_CategoryProduct]
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

	BEGIN TRY
		BEGIN TRANSACTION


		SELECT @WebSiteId = dbo.fn_WebSiteForEtlSourceID(@EtlSourceId);

		IF @WebSiteId IS NULL
		BEGIN
			SET @ErrorMessage = 'No website found for Etl Source Id ' + @EtlSourceId;
			THROW 60000, @ErrorMessage,  1;
		END

--###############################################################################################################################
--						TABLE CATEGORY
--###############################################################################################################################		

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
			'C2C53320-98DC-4ECA-8022-9EFC00DEA0DC'--@WebSiteId WebSiteId,
			,REPLACE(C.CategoryName, ' ', '') Name,
			C.CategoryName ShortDescription,
			'' SmallImagePath,
			'' LargeImagePath,
			GETDATE() ActivateOn,
			NULL DeactivateOn,
			REPLACE(C.CategoryName, ' ', '') URLSegment,
			'' MetaKeywords,
			'' MetaDescription,
			'' SortOrder,
			1 ShowDetail,
			C.CategoryName PageTitle,
			NULL ContentManagerId,
			NULL DocumentManagerId,
			'' ERPProductValues,
			0 IsFeatured,
			0 IsDynamic,
			NULL RuleManagerId,
			C.CategoryName ImageAltText,
			GETDATE() CreatedOn,
			'',--@UserName CreatedBy,
			GETDATE() ModifiedOn,
			'',--@UserName ModifiedBy,
			Path Path,
			ParentPath ParentPath
			FROM dbo.vw_Category C;

		-- Grab IDs from existing categories from Insite
		WITH CTE AS
		(
			SELECT 
				CAST('' AS NVARCHAR(255)) Parent,
				C.Id,
				C.ParentId,
				C.Name
			FROM [Insite.ExpressPipe]..Category c
			WHERE ParentId IS NULL
			UNION ALL SELECT 
				--CAST(C0.Parent + N'|' + C0.Name AS NVARCHAR(255)) Parent,
				Cast([dbo].[fn_GetCategoryFullPathInsite](C.ParentId) as nvarchar(255)) Parent,
				C.Id,
				C0.ParentID,
				C.Name
			FROM [Insite.Expresspipe]..Category c
			JOIN CTE C0 ON C0.Id = c.ParentId
		)
		UPDATE Category
		SET 
			ID = c1.ID,
			ParentId = c2.ID
		FROM CTE
		--JOIN Category C ON C.Path =   CASE WHEN CTE.ParentId IS NOT NULL THEN SUBSTRING(CTE.Parent,2,len(CTE.Parent))  + '|' ELSE '' END + CTE.Name
		JOIN [Insite.ExpressPipe]..Category c1 ON C1.ID = CTE.ID
		JOIN Category C ON C.Path =  [dbo].[fn_GetCategoryFullPathInsite](C1.Id)
		LEFT OUTER JOIN [Insite.ExpressPipe]..Category c2 ON C2.ID = CTE.ParentId

		-- Update the remaining parentIDs
		UPDATE C
		SET C.ParentID = C1.Id
		--SELECT C.ParentID,  C1.Id, C.ParentPath
		FROM Category C
		JOIN Category C1 ON C1.Path = C.ParentPath
		--JOIN Category C1 ON [dbo].[fn_GetCategoryFullPathETL](C1.Id) = [dbo].[fn_GetCategoryFullPathETL](C.ParentId)
		WHERE C.ParentID IS NULL
		AND C.ParentPath <> ''
		--AND [dbo].[fn_GetCategoryFullPathETL](C.ParentId) <> ''

--###############################################################################################################################
--						TABLE CATEGORY PRODUCT
--###############################################################################################################################
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

			-- Tap existing Category Product Id from the InsiteExpressPipe CategoryProduct table
			--	and update back to ETL
			  UPDATE ETL_CP
			     SET Id = IXP_CP.Id
			    FROM [insite.expresspipe]..CategoryProduct IXP_CP
		  INNER JOIN ETL_ECommerce..CategoryProduct ETL_CP
		          ON (IXP_CP.ProductId = ETL_CP.ProductId
				 AND IXP_CP.CategoryId = ETL_CP.CategoryId)
		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		IF @@TRANCOUNT > 0
			ROLLBACK TRANSACTION --RollBack in case of Error
		THROW;
	END Catch;
	
END