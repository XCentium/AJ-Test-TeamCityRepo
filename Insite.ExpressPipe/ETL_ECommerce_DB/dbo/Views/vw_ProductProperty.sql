














CREATE VIEW [dbo].[vw_ProductProperty]
AS
    SELECT CustomerItemId ERPPartNo, 'CustomerManufacturerName' Name, CustomerManufacturerName Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerManufacturerName, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'CustomerManufacturerPartNumber' Name, CASE WHEN IsGenericProduct = 'Y' then PG_CustomerManufacturerPartNumber ELSE CustomerManufacturerPartNumber END Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerManufacturerPartNumber, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'CustomerDescription' Name, CustomerDescription Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerDescription, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'CustomerUPC' Name, CAST(CustomerUPC AS VARCHAR(20)) Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerUPC, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'CustomerPriceLine' Name, CustomerPriceLine Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerPriceLine, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'CustomerPC' Name, CustomerPC Value FROM [vw_ProductGenericData] WHERE ISNULL(CustomerPC, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'CustomerStatus' Name, ISNULL(CustomerStatus,0) Value FROM [vw_ProductGenericData] 
    UNION SELECT CustomerItemId ERPPartNo, 'ManufacturerName' Name, CASE WHEN IsGenericProduct = 'Y' then '' ELSE ManufacturerName END Value FROM [vw_ProductGenericData] WHERE ISNULL(ManufacturerName, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'ProductName' Name, ProductName Value FROM [vw_ProductGenericData] WHERE ISNULL(ProductName, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'BrandName' Name, BrandName Value FROM [vw_ProductGenericData] WHERE ISNULL(BrandName, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'SeriesModelFigure' Name, SeriesModelFigureNumber Value FROM [vw_ProductGenericData] WHERE ISNULL(SeriesModelFigureNumber, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'AdditionalInformation' Name, AdditionalInformation Value FROM [vw_ProductGenericData] WHERE ISNULL(AdditionalInformation, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'PackageVolume' Name, CAST(PackageVolume AS VARCHAR(20)) Value FROM [vw_ProductGenericData] WHERE ISNULL(PackageVolume, 0) <> 0
    UNION SELECT CustomerItemId ERPPartNo, 'CountryOfOrigin' Name, CountryOfOrigin Value FROM [vw_ProductGenericData] WHERE ISNULL(CountryOfOrigin, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'LeadFree' Name, LeadFree Value FROM [vw_ProductGenericData] WHERE ISNULL(LeadFree, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'MercuryFree' Name, MercuryFree Value FROM [vw_ProductGenericData] WHERE ISNULL(MercuryFree, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'WaterSenseSaver' Name, WaterSenseSaver Value FROM [vw_ProductGenericData] WHERE ISNULL(WaterSenseSaver, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'EnergyStarRated' Name, EnergyStarRated Value FROM [vw_ProductGenericData] WHERE ISNULL(EnergyStarRated, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'CommodityGeneric' Name, CommodityGeneric Value FROM [vw_ProductGenericData] WHERE ISNULL(CommodityGeneric, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'TSCommentsForCustomer' Name, TSCommentsForCustomer Value FROM [vw_ProductGenericData] WHERE ISNULL(TSCommentsForCustomer, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'MfrItemPage' Name, MfrItemPage Value FROM [vw_ProductGenericData] WHERE ISNULL(MfrItemPage, '') <> ''
    UNION SELECT CustomerItemId ERPPartNo, 'AdditionalUrl2' Name, AdditionalUrl2 Value FROM [vw_ProductGenericData] WHERE ISNULL(AdditionalUrl2, '') <> ''
	UNION SELECT CustomerItemId ERPPartNo, 'GenericPartNumber' Name, GenericSKU Value FROM [vw_ProductGenericData] WHERE ISNULL(GenericSKU, '') <> ''
	--UNION SELECT CustomerItemId ERPPartNo, 'IsNonTSP' Name, 'No' Value FROM [vw_ProductGenericData] 