
CREATE PROCEDURE [dbo].[sp_PopulateInsiteProductList]
--*****************************************************************************************************************
-- Name:	sp_Execute_ALL_SPs_ToPopulateProductDataInETL_DB
-- Descr:	Executes all the Product data related stored procedures in ETL Database for the data population
-- Created:	7/24/2015 Venkatesan PS XCentium
-- Altered:
-- Test With: exec [sp_Populate_ALL_Data_In_ETLDB] 'EXP', 'ServiceUser', 'InsiteCommerce'
--*****************************************************************************************************************
(
	
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE [Insite.Morsco].Custom.ProductList AS Target
			USING
			(
				SELECT * FROM ETL_Ecommerce..ProductList AS Source
			) AS Source
			ON Target.[Id] = Source.[Id]
		WHEN MATCHED AND 
			(
				Target.ProductListTypeId <> Source.ProductListTypeId
				OR Target.CustomerId <> Source.CustomerId
				OR Target.ProductId <> Source.ProductId
				-- Not changing CustomerNumber/CustomerSequence properly when one value is null 
				-- this will overchange if null, but they should not be null, currently
				OR ISNULL(Target.CustomerNumber,'x') <> ISNULL(Source.CustomerNumber,'y')
				OR ISNULL(Target.CustomerSequence,'x') <> ISNULL(Source.CustomerSequence,'y')
				OR Target.ProductErpNumber <> Source.ProductErpNumber
				OR Target.Frequency <> Source.Frequency
				OR Target.QtyOrdered <> Source.QtyOrdered
				OR Target.QtyShipped <> Source.QtyShipped
				Or ISNULL(Target.LastOrderedDate,'1/1/1900') <> ISNULL(Source.LastOrderedDate,'1/1/1900')
				Or ISNULL(Target.LastShippedDate,'1/1/1900') <> ISNULL(Source.LastShippedDate,'1/1/1900')
			) THEN
			UPDATE SET 
				Target.ProductListTypeId = Source.ProductListTypeId,
				Target.CustomerId = Source.CustomerId,
				Target.ProductId = Source.ProductId,
				Target.CustomerNumber = Source.CustomerNumber,
				Target.CustomerSequence = Source.CustomerSequence,
				Target.ProductErpNumber = Source.ProductErpNumber,
				Target.Frequency = Source.Frequency,
				Target.QtyOrdered = Source.QtyOrdered,
				Target.QtyShipped = Source.QtyShipped,
				Target.LastOrderedDate = Source.LastOrderedDate,
				Target.LastShippedDate = Source.LastShippedDate,
				Target.ModifiedOn = Source.ModifiedOn,
				Target.ModifiedBy = Source.ModifiedBy
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      Id,
			      ProductListTypeId,
			      CustomerId,
			      ProductId,
			      CustomerNumber,
			      CustomerSequence,
			      ProductErpNumber,
			      Frequency,
				  QtyOrdered,
				  QtyShipped,
				  LastOrderedDate,
			      LastShippedDate,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.Id,
			   Source.ProductListTypeId,
			   Source.CustomerId,
			   Source.ProductId,
			   Source.CustomerNumber,
			   Source.CustomerSequence,
			   Source.ProductErpNumber,
			   Source.Frequency,
               Source.QtyOrdered,
			   Source.QtyShipped,
			   Source.LastOrderedDate,
			   Source.LastShippedDate,
			   Source.CreatedOn,
			   Source.CreatedBy,
			   Source.ModifiedOn,
			   Source.ModifiedBy			)
		WHEN NOT MATCHED BY Source THEN
			DELETE;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END