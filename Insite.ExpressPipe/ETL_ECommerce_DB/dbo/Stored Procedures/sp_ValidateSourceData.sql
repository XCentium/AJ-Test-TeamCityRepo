
CREATE PROCEDURE [dbo].[sp_ValidateSourceData](@EtlSourceID VARCHAR(20))
AS
BEGIN
	DECLARE @NL NVARCHAR(2) = CHAR(13)
	DECLARE @SQL NVARCHAR(MAX) = ''
	DECLARE @ErrorMsg VARCHAR(MAX) = ''

	--
	-- Get counts for use with count-based tests
	--
	IF OBJECT_ID('tempdb..Counts') IS NOT NULL
	BEGIN
		DROP TABLE #Counts
	END
	CREATE TABLE #Counts
	(
		[Table] SysName,
		[Count] int
	)

	SELECT @SQL = @SQL + CASE WHEN @SQL = '' THEN '' ELSE 'UNION ' END
		+ 'SELECT ''' + TableName + ''' [Table], COUNT(*) [Count] '
		+ 'FROM DM_ECommerce.' + TableName + ' (NOLOCK) '
		+ CASE WHEN HasEtlSourceID = 1 THEN 'WHERE ETLSourceID = ''' + @EtlSourceID + '''' ELSE '' END
		+ @NL
	FROM ValidationItem;

	INSERT INTO #Counts EXEC sp_ExecuteSQL @SQL;

	--
	-- Perform Count Based Tests
	--
	DECLARE @ID UNIQUEIDENTIFIER = (SELECT MIN(ID) FROM ValidationItem);
	DECLARE @Table SYSNAME
	DECLARE @PrevCount int
	DECLARE @CurrCount int
	DECLARE @VarianceType VARCHAR(10)
	DECLARE @VarianceAmount DECIMAL

	WHILE @ID IS NOT NULL
	BEGIN
		SELECT 
			@Table = [TableName],
			@PrevCount = [LastCount],
			@VarianceType = [VarianceType],
			@VarianceAmount = [VarianceAmount]
		FROM ValidationItem WHERE ID = @ID

		SELECT @CurrCount = [Count] FROM #Counts WHERE [Table] = @Table

		-- Percentage based
		IF @VarianceType = 'Percent' AND (1 - @PrevCount / @CurrCount) > @VarianceAmount 
		BEGIN
			SET @ErrorMsg = @ErrorMsg + 'Table ' + @Table + ' -- percent variance (' + CAST(@VarianceAmount AS VARCHAR(20)) + ') exceeds max (' 
				+ CAST(1 - @PrevCount / @CurrCount AS VARCHAR(20)) + ')' + @NL
		END
		ELSE IF @VarianceType = 'Percent' AND 1 - @CurrCount / @PrevCount > @VarianceAmount
		BEGIN
			SET @ErrorMsg = @ErrorMsg + 'Table ' + @Table + ' -- percent variance (' +  CAST(@VarianceAmount AS VARCHAR(20)) + ') exceeds max (' 
				+ CAST(1 - @CurrCount / @PrevCount AS VARCHAR(20)) + ')' + @NL
		END
		ELSE IF @VarianceType = 'Count' 
			AND ABS(@PrevCount - @CurrCount) > @VarianceAmount
		BEGIN
			SET @ErrorMsg = @ErrorMsg + 'Table ' + @Table + ' -- count variance (' +  CAST(@VarianceAmount AS VARCHAR(20)) + ') exceeds max ('
				+ CAST(ABS(@PrevCount - @CurrCount) AS VARCHAR(20)) + ')' + @NL
		END

		SELECT @ID = MIN(ID) FROM ValidationItem WHERE ID > @ID
	END

	--Checking if all invoices has records in Shipment table
	SET @Table = 'InvoiceDataInShipmentTable';
	SET @VarianceAmount = '0'; -- TODO::
	SELECT @PrevCount = count(*)  from vw_QualifyingInvoices QI
	SELECT @CurrCount = count(*)  from vw_QualifyingInvoices QI
	JOIN vw_QualifyingShipments QS ON Qi.EclipseID = QS.EclipseID AND QI.GenerationID = QS.GenerationID

	IF (1 - @PrevCount / @CurrCount) <> @VarianceAmount 
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'Table ' + @Table + ' -- percent variance (' + CAST(@VarianceAmount AS VARCHAR(20)) + ') exceeds max (' 
			+ CAST(1 - @PrevCount / @CurrCount AS VARCHAR(20)) + ')' + @NL
	END

	--Checking for product record duplicates
	;WITH CTE AS
	(
		SELECT 1 CNT FROM vw_ProductData P
		 WHERE P.ETLSourceId = @EtlSourceID
			GROUP BY ERPNumber having count(*) > 1
	)SELECT @CurrCount = count(*) FROM CTE;
	
	IF(@CurrCount > 0)
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'Table Product has ' + CAST(@CurrCount as Varchar(10)) + ' duplicate records.' + @NL
	END
	
	--Checking for Bill To Customer record duplicates
	;WITH CTE AS
	(
		SELECT 1 CNT FROM [vw_QualifyingCustomers] C
		WHERE C.ETLSourceId = @EtlSourceID and IsBillTo = 1
         GROUP BY CustomerNo, BillToCustomerId having count(*) > 1
	)SELECT @CurrCount = count(*) FROM CTE;
	IF(@CurrCount > 0)
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'Table Bill To Customer has ' + CAST(@CurrCount as Varchar(10)) + ' duplicate records.' + @NL
	END

	--Checking for Ship To Customer record duplicates
	;WITH CTE AS
	(
		SELECT 1 CNT FROM [vw_QualifyingCustomers] C
		WHERE C.ETLSourceId = @EtlSourceID and IsBillTo = 1
         GROUP BY BillToCustomerId , CustomerNo having count(*) > 1
	)SELECT @CurrCount = count(*) FROM CTE;
	IF(@CurrCount > 0)
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'Table Ship To Customer has ' + CAST(@CurrCount as Varchar(10)) + ' duplicate records.' + @NL
	END
	
	--Checking for Branch Address blank check
	SELECT @CurrCount =  count(*) 
	FROM DM_ECommerce..Branch B
	WHERE B.ETLSourceId = @EtlSourceID AND
		  B.StockingBranch = 1 AND
		  (ISNULL(Address1,'') = '' OR ISNULL(City,'') = '' OR ISNULL(State,'') = '' OR ISNULL(Zip,'') = '') 
	IF (@CurrCount > 0)
	BEGIN
		SET @ErrorMsg = @ErrorMsg + 'Table Branch has ' + CAST(@CurrCount as Varchar(10)) + ' blank address values.' + @NL
	END

	--Update the last updated count on the DM tables
	IF (@ErrorMsg = '') 
	BEGIN
		TRUNCATE TABLE ValidationItem;

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllShipmentLines' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllShipmentLines

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllShipmentHeaders' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllShipmentHeaders

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllOrderLines' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllOrderLines

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllOrderHeaders' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllOrderHeaders

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllInvoiceLines' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllInvoiceLines

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'ksa.vw_AllInvoiceHeaders' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce.ksa.vw_AllInvoiceHeaders

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'dbo.Product' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce..Product

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'dbo.LastUpdate' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce..LastUpdate

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'dbo.Customer' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce..Customer

		INSERT ValidationItem (TableName, HasEtlSourceID, LastCount, VarianceType, VarianceAmount)
		Select 
		'dbo.Branch' TableName,
		1 HasEtlSourceID,
		count(*) LastCount ,
		'Percent' VarianceType,
		0.05 VarianceAmount
		from DM_ECommerce..Branch

	END
	ELSE
	BEGIN
		RAISERROR(@ErrorMsg,10,1); 
	END

END