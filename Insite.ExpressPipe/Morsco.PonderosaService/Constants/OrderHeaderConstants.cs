namespace Morsco.PonderosaService.Constants
{
    public static class OrderHeaderConstants
    {
        //Ponderosa order fields
        public const string ShipTo_ID = "ShipTo_ID";
        public const string Price_Branch = "Price_Branch";
        public const string Ship_Branch = "Ship_Branch";
        public const string Order_Status = "Order_Status";
        public const string Quote_Status = "Quote_Status";
        public const string Order_No = "Order_No";
        public const string Session_ID = "Session_ID";
        public const string Generation = "Generation";
        public const string Require_Date = "Require_Date";
        public const string Ship_Date = "Ship_Date";
        public const string Customer_PO = "Customer_PO";
        public const string Release_No = "Release_No";
        public const string Writer = "Writer";
        public const string Order_By = "Order_By";
        public const string Ship_Via = "Ship_Via";
        public const string Freight = "Freight";
        public const string Handling = "Handling";
        public const string Tax = "Tax";
        public const string Tax_Exempt_No = "Tax_Exempt_No";
        public const string Tax_Jurisdiction = "Tax_Jurisdiction";
        public const string Keywords = "Keywords";
        public const string Web_Order_No = "Web_Order_No";
        public const string Shipping_Instr = "Shipping_Instr";
        public const string Internal_Notes = "Internal_Notes";
        public const string Phone_No = "Phone_No";
        public const string Sales_Source = "Sales_Source";
        public const string Salesperson = "Salesperson";
        public const string Salesperson_In = "Salesperson_In";
        public const string Terms = "Terms";
        public const string Name = "Name";
        public const string Address = "Address";
        public const string Address1 = "Address1";
        public const string Address2 = "Address2";
        public const string PostalCode = "PostalCode";
        public const string Shipping_Address = "Shipping_Address";
        public const string Shipping_Address1 = "Shipping_Address1";
        public const string Shipping_Address2 = "Shipping_Address2";
        public const string City = "City";
        public const string State = "State";
        public const string Zip = "Zip";
        public const string Phone = "Phone";
        public const string Bid_Expire_Date = "Bid_Expire_Date";
        public const string Retain_Lock = "Retain_Lock";
        public const string Credit_Card = "Credit_Card";

        //Credit Card Block
        public const string Element_Account_Id = "Element_Acct_ID";
        public const string Card_Type = "Card_Type";
        public const string Card_Number = "Card_Number";
        public const string Card_Holder = "Card_Holder";
        public const string Expire_Date = "Expire_Date";
        public const string Auth_Type = "Auth_Type";
        public const string Street_Address = "Street_Address";
        public const string Postal_Code = "Postal_Code";
        //Credit Card Block as it comes in from Customer Order Property 'CreditCardBlock'
        public const string TsElementAccountId = "elementAcctID";
        public const string TsCardType = "cardType";
        public const string TsCardNumber = "cardNumber";
        public const string TsCardHolder = "cardHolder";
        public const string TsExpireDate = "expireDate";
        public const string TsAuthType = "authType";
        public const string TsStreetAddress = "streetAddress";
        public const string TsPostalCode = "postalCode";

        public const string Bid = "B";
        
        //Request Constants
        public const string All_Generations = "All_Generations";
		
		//Auth Types
	    public const string MSCCreditCardAuthorizationType = "MSC_CreditCard_AuthorizationType";
	    public const string PreAuthorizeBeforeShipment = "1";
		public const string AuthorizeBeforeShipment = "2";
		public const string ReferenceOnly = "3";
		public const string AuthorizeAfterReview = "4";
    }
}
