
CREATE PROCEDURE [dbo].[sp_PopulateETLProductContent_Specfication] 
	-- Add the parameters for the stored procedure here
	@UserName as Varchar(100)
AS
-- =============================================
-- Author:		Venkatesan PS
-- Create date: 15th July 2015
-- Description:	This Procedure will poulation Content and Specification data 
				--ONE RECORD --> "LONG DESCRIPTION" AND 
				--ONE RECORD --> "FEATURES BENEFITS" for each product and  in the Product Table 
--				 Morsco.com ECLIPSE DB --> ETL DB
-- =============================================
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.

	DECLARE @ErrorMessage as Varchar(max);

	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

--###############################################################################################################################################
--			TABLE CONTENT MANAGER - ONE RECORD FOR EACH PRODUCT
--###############################################################################################################################################
			--*******************************************************
			--CLEAN UP THE EXISTING DATA
			TRUNCATE TABLE [DBO].[CONTENTMANAGER];
			TRUNCATE TABLE [dbo].[Content];
			TRUNCATE TABLE [dbo].[Specification];
			TRUNCATE TABLE [dbo].[ProductSpecification];
			
			--*******************************************************

--###############################################################################################################################################
--			TABLE SPECIFICATION - ADD ONE SPECIFCATION RECORD FOR EACH PRODUCT
--###############################################################################################################################################

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
						,[FeaturesBenefits] as Value
						,GETDATE() CreatedOn
						,@UserName CreatedBy
						,GETDATE() ModifiedOn
						,@UserName ModifiedBy
				   FROM [dbo].[vw_ProductSpecificationData]


--###############################################################################################################################################
--					TABLE PRODUCT SPECIFICATION 
--###############################################################################################################################################

			INSERT INTO	[dbo].[ProductSpecification]
						([ProductId]
						,[SpecificationId])
				 SELECT P.Id ProductId
			   			,S.Id SpecificationId 
				   FROM PRODUCT P
				   JOIN Specification S
					 ON P.ERPNumber = S.ERPNumber
			    ORDER BY P.Id	
									 

--###############################################################################################################################################
--					TABLE PRODUCT SPECIFICATION 
--###############################################################################################################################################

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
				   FROM [dbo].[vw_ProductSpecificationData]	PSD
				   JOIN Specification S ON PSD.ERPNumber = S.ERPNumber and PSD.SpecificationName = S.Name

--###############################################################################################################################################
--			TABLE CONTENT - ADD ONE CONTENT RECORD FOR EACH PRODUCT (ONE FOR LONG DESCRIPTION AND ONE FOR FEATURES BENEFITS
--###############################################################################################################################################


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
						,PSD.FeaturesBenefits HTML
						,NULL as [SubmittedForApprovalOn]
						,GETDATE() as [ApprovedOn]
						,GETDATE() as [PublishToProductionOn]
						,GETDATE() as [CreatedOn]
						,[CreatedById] = (SELECT Id FROM [insite.expresspipe]..UserProfile WHERE UserName = '')-- @UserName)
						,[ApprovedById] = (SELECT Id FROM [insite.expresspipe]..UserProfile WHERE UserName ='') -- @UserName)
						,1 as [Revision]
						,'' as [DeviceType]
						,[PersonaId] = (SELECT Id FROM [insite.expresspipe]..Persona WHERE Name = 'Default')
						,null as [LanguageId]
						,@UserName as [CreatedBy]
						,GETDATE() as [ModifiedOn]
						,@UserName as [ModifiedBy]		
				   FROM [dbo].[vw_ProductSpecificationData] PSD
				   JOIN Specification S ON S.ERPNumber = PSD.ERPNumber AND S.Name = PSD.SpecificationName
				   JOIN ContentManager CM ON CM.Id = S.ContentManagerId			
	
--###############################################################################################################################################



					-- Update the existing Specification ID from Insite DB to ETL DB
					UPDATE ELT_S
					   SET ELT_S.Id = IXP_S.Id
					  FROM Specification ELT_S
					  JOIN [insite.expresspipe]..Specification IXP_S ON ELT_S.Name = IXP_S.Name 
					   AND ELT_S.Value = IXP_S.Value
					  JOIN ContentManager CM ON CM.Id = ELT_S.ContentManagerId and CM.Id = IXP_S.ContentManagerId

					UPDATE ELT_CM
						SET ELT_CM.Id  = IXP_CM.Id 
 					  FROM ContentManager ELT_CM
					  JOIN [insite.expresspipe]..ContentManager IXP_CM ON ELT_CM.Id = IXP_CM.Id
					  JOIN Specification S ON ELT_CM.Id = S.ContentManagerId
					  JOIN Product P ON P.ERPNumber = S.ERPNumber
					  
 					UPDATE ELT_C 
					   SET ELT_C.Id = IXP_C.Id 
					  FROM Content ELT_C
					  JOIN [insite.expresspipe]..Content IXP_C ON ELT_C.Id = IXP_C.Id
					  JOIN ContentManager CM ON CM.Id = ELT_C.ContentManagerId
					  JOIN Specification S ON CM.Id = S.ContentManagerId
					  JOIN Product P ON P.ERPNumber = S.ERPNumber




				COMMIT TRANSACTION;
			END TRY
			BEGIN CATCH
				PRINT ERROR_MESSAGE()
				IF @@TRANCOUNT > 0
					ROLLBACK TRANSACTION --RollBack in case of Error
				THROW;			
			END CATCH
END