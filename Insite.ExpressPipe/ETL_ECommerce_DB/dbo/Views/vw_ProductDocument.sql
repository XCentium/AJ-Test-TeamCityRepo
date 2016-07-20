





CREATE VIEW [dbo].[vw_ProductDocument]
AS
    WITH Flattened AS
    (
        SELECT CustomerItemID ERPProductNo, 'MfrCatalogDocument' Name, MfrCatalogDocument URL, 'Catalog' DocumentType 
            FROM vw_TradeServicesProduct P WHERE ISNULL(MfrCatalogDocument,'') <> ''
        UNION SELECT CustomerItemID ERPProductNo, 'MfrSpecificationTechnicalDocument' Name, MfrSpecificationTechnicalDocument URL, 'Specifications'  DocumentType 
            FROM vw_TradeServicesProduct P WHERE ISNULL(MfrSpecificationTechnicalDocument,'') <> ''
		UNION SELECT CustomerItemID ERPProductNo, 'MfrItemDataDocument' Name, MfrItemDataDocument URL,  'Parts'  DocumentType 
            FROM vw_TradeServicesProduct P WHERE ISNULL(MfrItemDataDocument,'') <> ''
        UNION SELECT CustomerItemID ERPProductNo, 'MfrMsdsDocument' Name, MfrMsdsDocument URL ,  'MSDS'  DocumentType 
            FROM vw_TradeServicesProduct P WHERE ISNULL(MfrMsdsDocument,'') <> ''
        UNION SELECT CustomerItemID ERPProductNo, 'MfrInstallationOperatorDocument' Name, MfrInstallationOperatorDocument URL,  'Installation'  DocumentType 
            FROM vw_TradeServicesProduct P WHERE ISNULL(MfrInstallationOperatorDocument,'') <> ''
    )
    SELECT 
        F.ErpProductNo,
        F.Name,
        REPLACE(ISNULL(F.URL,''),'http:','https:') URL,
		F.DocumentType,
        P.ParameterValue
    FROM Flattened F
    JOIN ETLParameter P ON P.ParameterGroup = 'ProductDocumentName'
                       AND P.ParameterName = F.Name