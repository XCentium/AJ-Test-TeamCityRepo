ALTER ROLE [db_owner] ADD MEMBER [AD\Insite_Admins];


GO
ALTER ROLE [db_datawriter] ADD MEMBER [InsiteETL];


GO
ALTER ROLE [db_datareader] ADD MEMBER [InsiteETL];

