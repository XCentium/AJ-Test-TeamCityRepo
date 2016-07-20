










-- Attribute view
-- [CUSTOMER_Item ID] is product Name which is unique in Insite
CREATE VIEW [dbo].[vw_ProductSpecificationData] AS

		SELECT 
		P.Id ProductId,
		CustomerItemId as ERPNumber, 
		'Specification' ContentManagerName,
		'FEATURES BENEFITS' SpecificationName,
		FeaturesBenefits
		FROM vw_TradeServicesProduct TSP
		JOIN Product P
		On P.Name = CAST(TSP.CustomerItemID as nvarchar(50))
		WHERE ISNULL(FeaturesBenefits ,'') <> ''
		UNION
		SELECT 
		P.Id ProductId,
		CustomerItemId, 
		'Specification' ContentManagerName,
		'LONG DESCRIPTION' SpecificationName,
		LongDescription
		FROM vw_TradeServicesProduct TSP
		JOIN Product P
		On P.Name = CAST(TSP.CustomerItemID as nvarchar(50))
		WHERE ISNULL(LongDescription ,'') <> ''