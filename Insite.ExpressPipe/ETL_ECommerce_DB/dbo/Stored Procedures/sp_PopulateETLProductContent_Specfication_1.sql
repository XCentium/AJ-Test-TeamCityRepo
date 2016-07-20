
CREATE PROCEDURE [dbo].[sp_PopulateETLProductContent_Specfication] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
--*****************************************************************************************************************
-- Name:	[sp_PopulateETLProductContent_Specfication]
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_PopulateETLProductContent_Specfication] 'EXP', 'ServiceUser'
--*****************************************************************************************************************

BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	DECLARE @ErrorMessage as Varchar(max);

	SET NOCOUNT ON;

		--BEGIN TRANSACTION
		SET XACT_ABORT ON;
		--*****************************************************************************************************************
		--CLEAN UP THE EXISTING DATA
		TRUNCATE TABLE [DBO].[CONTENTMANAGER];
		TRUNCATE TABLE [dbo].[Content];
		TRUNCATE TABLE [dbo].[Specification];
		TRUNCATE TABLE [dbo].[ProductSpecification];
			
		--*****************************************************************************************************************

		--*****************************************************************************************************************
		--	TABLE SPECIFICATION - ADD ONE SPECIFCATION RECORD FOR EACH PRODUCT
		--*****************************************************************************************************************

		INSERT INTO [dbo].[Specification]
			([Id]
			,[ParentId]
			,[ContentManagerId]
			,[Name]
			,[ERPNumber]
			,[SortOrder]
			,[Description]
			,[IsActive]
			,[Value]
			,[CreatedOn]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy])  
		SELECT 
  			NEWID() AS ID
			,NULL as ParentId
			,NEWID() AS CONTENTMANGERID
			,[SpecificationName]
			,[ERPNumber]
			,1 as SortOrder
			,[SpecificationName] as Description	      
			,1 as Active
			,dbo.fn_ScrubData([FeaturesBenefits]) as Value
			,GETDATE() CreatedOn
			,@UserName CreatedBy
			,GETDATE() ModifiedOn
			,@UserName ModifiedBy
		FROM [dbo].[vw_ProductSpecificationData]


		--*****************************************************************************************************************
		--					TABLE PRODUCT SPECIFICATION 
		--*****************************************************************************************************************

		INSERT INTO	[dbo].[ProductSpecification]
			([ProductId]
			,[SpecificationId])
		SELECT P.Id ProductId
			,S.Id SpecificationId 
		FROM PRODUCT P (NOLOCK)
		JOIN Specification S (NOLOCK) ON P.ERPNumber = S.ERPNumber
		ORDER BY P.Id	

		--*****************************************************************************************************************
		--					TABLE PRODUCT SPECIFICATION 
		--*****************************************************************************************************************

		INSERT INTO	[CONTENTMANAGER]
			([ID]
			,[NAME]
			,[CREATEDON]
			,[CREATEDBY]
			,[MODIFIEDON]
			,[MODIFIEDBY])
		SELECT ContentManagerId as Id
			,ContentManagerName as Name
			,GETDATE() CreatedOn
			,@UserName CreatedBy
			,GETDATE() ModifiedOn
			,@UserName ModifiedBy
		FROM [dbo].[vw_ProductSpecificationData] PSD
		JOIN Specification S (NOLOCK) ON PSD.ERPNumber = S.ERPNumber and PSD.SpecificationName = S.Name

		--*****************************************************************************************************************
		--TABLE CONTENT - ADD ONE CONTENT RECORD FOR EACH PRODUCT (ONE FOR LONG DESCRIPTION AND ONE FOR FEATURES BENEFITS
		--*****************************************************************************************************************

		DECLARE @LID as UNIQUEIDENTIFIER;
		DECLARE @CreatedById as UNIQUEIDENTIFIER;
		DECLARE @ApprovedById as UNIQUEIDENTIFIER;
		DECLARE @PersonaId as UNIQUEIDENTIFIER;

		SELECT @LID = Id FROM [Insite.Morsco]..Language where LanguageCode = 'en-us';
		SELECT @CreatedById = Id FROM [Insite.Morsco]..UserProfile WHERE UserName =  @UserName;
		SELECT @ApprovedById = Id FROM [Insite.Morsco]..UserProfile WHERE UserName = @UserName;
		SELECT @PersonaId = Id FROM [Insite.Morsco]..Persona WHERE Name = 'Default';

		INSERT INTO [dbo].[Content]
			([Id]
			,[ContentManagerId]
			,[Name]
			,[Type]
			,[Html]
			,[SubmittedForApprovalOn]
			,[ApprovedOn]
			,[PublishToProductionOn]
			,[CreatedOn]
			,[CreatedById]
			,[ApprovedById]
			,[Revision]
			,[DeviceType]
			,[PersonaId]
			,[LanguageId]
			,[CreatedBy]
			,[ModifiedOn]
			,[ModifiedBy])
		SELECT	NEWID() Id
			,CM.Id ContentManagerId
			,'Revision' as [Name]
			,'' as [Type]
			,dbo.fn_ScrubData(PSD.FeaturesBenefits) HTML
			,NULL as [SubmittedForApprovalOn]
			,GETDATE() as [ApprovedOn]
			,GETDATE() as [PublishToProductionOn]
			,GETDATE() as [CreatedOn]
			,@CreatedById
			,@ApprovedById
			,1 as [Revision]
			,'' as [DeviceType]
			,@PersonaId
			,@LID as [LanguageId]
			,@UserName as [CreatedBy]
			,GETDATE() as [ModifiedOn]
			,@UserName as [ModifiedBy]		
		FROM [dbo].[vw_ProductSpecificationData] PSD
		JOIN Specification S (NOLOCK) ON S.ERPNumber = PSD.ERPNumber AND S.Name = PSD.SpecificationName
		JOIN ContentManager CM (NOLOCK) ON CM.Id = S.ContentManagerId			
	
		--*****************************************************************************************************************
		-- Update the existing IDs of the Specification, Content and ContentManager tables
		--*****************************************************************************************************************
		
		SELECT
		 P.ErpNumber,
		 S.Name SpecificationName,
		 CM.Name ContentManagerName,
		 P.ID EtlProductID,
		 S.ID EtlSpecificationID,
		 CM.Id EtlContentManagerID,
		 C.Id ETLContentId,
		 -- these fields will be replaced with Insite IDs.
		 P.ID InsiteProductID,
		 S.ID InsiteSpecificationID,
		 CM.Id InsiteContentManagerID,
		 C.Id InsiteContentId
		INTO #Xref
		FROM Product P
		JOIN ProductSpecification PS ON PS.ProductId = P.Id
		JOIN Specification S ON S.ID = PS.SpecificationId
		JOIN ContentManager CM ON CM.Id = S.ContentManagerId
		JOIN Content C ON c.ContentManagerId = CM.Id
		ORDER BY ERPNumber

		; WITH Insite AS
		(
		 SELECT
		  P.ErpNumber,
		  S.Name SpecificationName,
		  CM.Name ContentManagerName,
		  P.ID InsiteProductID,
		  S.ID InsiteSpecificationID,
		  CM.Id InsiteContentManagerID,
		  C.Id InsiteContentID
		 FROM [Insite.Morsco]..Product P
		 JOIN [Insite.Morsco]..ProductSpecification PS ON PS.ProductId = P.Id
		 JOIN [Insite.Morsco]..Specification S ON S.ID = PS.SpecificationId
		 JOIN [Insite.Morsco]..ContentManager CM ON CM.Id = S.ContentManagerId
		 JOIN [Insite.Morsco]..Content C ON CM.Id = C.ContentManagerId
		)
		UPDATE XR
		SET 
		 XR.InsiteProductid = O.InsiteProductId,
		 XR.InsiteSpecificationID = O.InsiteSpecificationID,
		 XR.InsiteContentManagerID = O.InsiteContentManagerID,
		 XR.InsiteContentID = O.InsiteContentID
		FROM #Xref XR
		JOIN Insite O ON O.ErpNumber = XR.ErpNumber
				   AND O.SpecificationName = XR.SpecificationName
			 AND O.ContentManagerName = XR.ContentManagerName

		 --Update ContentManager
		UPDATE CM
		SET 
		 CM.ID = XR.InsiteContentManagerID
		FROM #Xref XR
		JOIN ContentManager CM ON CM.ID = XR.EtlContentManagerID

		 --Update Content
		UPDATE C
		SET 
		 C.ID = XR.InsiteContentID,
		 C.ContentManagerId = XR.InsiteContentManagerID
		FROM #Xref XR
		JOIN Content C ON C.ID = XR.EtlContentID

		-- Update Specification
		UPDATE S
		SET
		 S.ID = XR.InsiteSpecificationID,
		 S.ContentManagerID = XR.InsiteContentManagerID
		FROM #Xref XR
		JOIN Specification S ON S.ID = XR.ETLSpecificationID

		-- ProductSpecification
		UPDATE PS
		SET 
		 PS.ProductId = XR.InsiteProductID,
		 PS.SpecificationId = XR.InsiteSpecificationId
		FROM #Xref XR
		JOIN ProductSpecification PS ON PS.ProductId = XR.EtlProductID
									AND PS.SpecificationId = XR.EtlSpecificationID
 
		IF OBJECT_ID('tempdb..#Xref') IS NOT NULL
			DROP TABLE #Xref
	--*****************************************************************************************************************

		
					  
 					


END