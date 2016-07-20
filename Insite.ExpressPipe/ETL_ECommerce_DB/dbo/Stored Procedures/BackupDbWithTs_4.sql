
CREATE PROC [dbo].[BackupDbWithTs]
@db_name SYSNAME
,@folder NVARCHAR(255)
,@backup_type VARCHAR(13)
,@backup_extension VARCHAR(10)
,@with_checksum CHAR(1) = 'Y'
,@do_verification CHAR(1) = 'Y'
AS
DECLARE @sql NVARCHAR(4000)
DECLARE @filename NVARCHAR(255)
DECLARE @full_path_and_filename NVARCHAR(1000)
DECLARE @err_msg NVARCHAR(2000)
DECLARE @crlf VARCHAR(2)
SET @crlf = CHAR(13) + CHAR(10)

--Verify valid backup type
IF @backup_type NOT IN('DATABASE', 'LOG', 'DIFFERENTIAL')
BEGIN
SET @err_msg = 'Backup type ' + @backup_type + ' is not valid.
Allowed values are DATABASE, LOG and DIFFERENTIAL'
RAISERROR(@err_msg, 16, 1)
RETURN -101
END

--Make sure folder name ends with '\'
IF RIGHT(@folder, 1) <> '\'
SET @folder = @folder + '\'

--Make file extension starts with '.'
IF LEFT(@backup_extension, 1) <> '.'
SET @backup_extension = '.' + @backup_extension

--Construct filename  
SET @filename = @db_name + '_' + REPLACE(REPLACE(REPLACE(CONVERT(CHAR(16), CURRENT_TIMESTAMP, 120), '-', ''), ' ', ''), ':', '')

--Construct full path and file name  
SET @full_path_and_filename = @folder + @filename + @backup_extension

--Construct backup command  
SET @sql = 'BACKUP ' + CASE @backup_type WHEN 'LOG' THEN 'LOG' ELSE 'DATABASE' END + ' ' + QUOTENAME(@db_name) + @crlf
SET @sql = @sql + 'TO DISK = ' + QUOTENAME(@full_path_and_filename,'''') + @crlf 
SET @sql = @sql + 'WITH' + @crlf
SET @sql = @sql + ' COMPRESSION,' + @crlf
SET @sql = @sql + ' NOINIT,' + @crlf
SET @sql = @sql + ' NAME = ' + QUOTENAME(@filename,'''') + ',' + @crlf

IF @backup_type = 'DIFFERENTIAL'
SET @sql = @sql + ' DIFFERENTIAL,' + @crlf

IF @with_checksum <> 'N'
SET @sql = @sql + ' CHECKSUM,' + @crlf

--Add backup option below if you want to!!!

--Remove trailing comma and CRLF
SET @sql = LEFT(@sql, LEN(@sql) - 3)

--PRINT @sql
EXEC(@sql)

IF @do_verification = 'Y'
RESTORE VERIFYONLY FROM DISK = @full_path_and_filename