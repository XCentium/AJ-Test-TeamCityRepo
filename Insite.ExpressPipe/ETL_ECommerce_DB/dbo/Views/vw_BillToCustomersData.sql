-- Attribute view
-- [CUSTOMER_Item ID] is product Name which is unique in Insite
CREATE VIEW [dbo].[vw_BillToCustomersData] AS

		-- Join for ship-tos
		WITH BillToShipTo AS
		(
			 -- This is the faked part using orders
			 SELECT DISTINCT
					S.BillToNo,
					S.ShipToNo
			   FROM	DM_ECommerce..vw_AllSalesLedgerHeaders S
			  WHERE	S.EtlSourceId = 'EXP'
 			  UNION -- We also are getting the BillToNo in Customer
			 SELECT DISTINCT
					C.BillToCustomerId,
					C.CustomerNo ShipToNo
			   FROM DM_ECommerce..Customer C
			  WHERE C.EtlSourceID = 'EXP'
			    AND C.IsShipTo = 1
			    AND C.BillToCustomerId IS NOT NULL
    		  UNION -- We can also include (not sure if we do this or not) Customers who are both billto and shipto
		     SELECT DISTINCT
					C.CustomerNo,
					C.CustomerNo ShipToNo
			   FROM DM_ECommerce..vw_BillToCustomers C
			  WHERE C.ETLSourceID = 'EXP'
				AND C.IsShipTo = 1
		),
		-- Join for bill-tos
		-- THROW AWAY CODE
		-- There are many duplicates in ShipToCustomers, so identify them and take the first of each 
		-- with the highest credit limit -- not really a business rule
		CustomersWithDuplicates AS
		(
			SELECT	ROW_NUMBER() OVER (PARTITION BY CustomerNo ORDER BY CreditLimit DESC) DuplicateRowNum,
				*
			FROM DM_ECommerce..vw_BillToCustomers
			WHERE ETLSourceID = 'EXP'
		)

		SELECT [ETLSourceID]
			  ,[CustomerNo]
			  ,[CustomerName]
			  ,[AddressLine1]
			  ,[AddressLine2]
			  ,[City]
			  ,[State]
			  ,[Zip]
			  ,[Country]
			  ,[PhoneNo]
			  ,[FaxNo]
			  ,[Email]
			  ,[TermsCode]
			  ,[ShipViaCode]
			  ,[Territory]
			  ,[CustomerGroup]
			  ,[Salesperson]
			  ,[CreditLimit]
			  ,[NoOrderEntryFlag]
			  ,[CreditLimitNoOrderEntryFlag]
			  ,[CreditLimitOverrideAuthorizedFlag]
			  ,[CreditHold]
			  ,[IsBillTo]
			  ,[IsShipTo]
			  ,0 as [BillToCustomerID]
		  FROM CustomersWithDuplicates
		 WHERE DuplicateRowNum = 1