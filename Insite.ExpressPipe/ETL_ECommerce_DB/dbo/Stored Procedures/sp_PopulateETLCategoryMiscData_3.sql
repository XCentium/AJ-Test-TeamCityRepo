
CREATE PROCEDURE [dbo].[sp_PopulateETLCategoryMiscData]
(
	@UserName VARCHAR(50)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION

			;MERGE CategoryMiscData AS Target
			USING
			(
				SELECT * FROM CategoryMiscData_Scrub AS Source
			) AS Source
			ON Target.ERPNumber = Source.ERPNumber
		WHEN MATCHED AND 
			(
				Target.ERPNumber <> Source.ERPNumber
				OR Target.[SmallImage] <> Source.[Small Image]
				OR Target.[LongDescription] <> Source.[Long Description]
			) THEN
			UPDATE SET 
				Target.ERPNumber = Source.ERPNumber,
				Target.[SmallImage] = Source.[Small Image],
				Target.[LongDescription] = Source.[Long Description],
				Target.ModifiedOn = GETDATE(),
				Target.ModifiedBy = @UserName
			WHEN NOT MATCHED BY TARGET THEN
			INSERT 
				(
			      ERPNumber,
			      SmallImage,
			      LongDescription,
			      CreatedOn,
			      CreatedBy,
			      ModifiedOn,
			      ModifiedBy				)
			VALUES
			(
			   Source.ERPNumber
			   ,Source.[Small Image]
			   ,Source.[Long Description]
			   ,GETDATE() 
			   ,@UserName 
			   ,GETDATE() 
			   ,@UserName 			)
		--WHEN NOT MATCHED BY Source THEN
		--	DELETE
			;

		COMMIT TRANSACTION
	END TRY
	BEGIN Catch
		PRINT ERROR_MESSAGE()
		ROLLBACK TRANSACTION
	END Catch;

END