using System;
using System.Collections.Generic;
using Morsco.PonderosaService.Common;
using Morsco.PonderosaService.Constants;
using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class OrderHeader
    {
        private HeaderDetailResult _orderResult;

        public OrderHeader(HeaderDetailResult orderResult)
        {
            _orderResult = orderResult;
            RequireDate = DateTime.Now;
            ShipDate = DateTime.Now;
            OrderDetail = new List<OrderDetailBase>();
        }
        public OrderHeader()
        {
            RequireDate = DateTime.Now;
            ShipDate = DateTime.Now;
            OrderDetail = new List<OrderDetailBase>();
        }

        // Required
        private int? _shipToId;
        public int? ShipToId
        {
            get { return _shipToId ?? DataUtilities.GetHeaderValue<int>(_orderResult, OrderHeaderConstants.ShipTo_ID); }
            set { _shipToId = value; }
        }

        private string _priceBranch;
        public string PriceBranch
        {
            get { return _priceBranch ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Price_Branch); }
            set { _priceBranch = value; }
        }

        private string _shipBranch;
        public string ShipBranch
        {
            get { return _shipBranch ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Ship_Branch); }
            set { _shipBranch = value; }
        }

        private string _orderStatus;
        public string OrderStatus
        {
            get { return _orderStatus ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Order_Status); }
            set { _orderStatus = value; }
        }

        private string _quoteStatus;
        public string QuoteStatus
        {
            get { return _quoteStatus ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Quote_Status); }
            set { _quoteStatus = value; }
        }

        private string _orderNo;
        public string OrderNo
        {
            get { return _orderNo ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Order_No); }
            set { _orderNo = value; }
        }

        /// <summary>
        /// Ponderosa calls it a "Generation" but it's a list of generations
        /// </summary>
        private string _generation;
        public string Generation
        {
            get
            {
                if (_generation == null && _orderResult != null)
                {
                    _generation = DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Generation);
                }
                return _generation;
            }
        }

        //Optional Dates
        private DateTime? _requireDate;
        public DateTime? RequireDate
        {
            get { return _requireDate ?? DataUtilities.GetHeaderValue<DateTime?>(_orderResult, OrderHeaderConstants.Require_Date); }
            set { _requireDate = value; }
        }

        private DateTime? _shipDate;
        public DateTime? ShipDate
        {
            get { return _shipDate ?? DataUtilities.GetHeaderValue<DateTime?>(_orderResult, OrderHeaderConstants.Ship_Date); }
            set { _shipDate = value; }
        }

        //Optional
        private string _customerPo;
        public string CustomerPo
        {
            get { return _customerPo != null ? _customerPo : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Customer_PO); }
            set { _customerPo = value; }
        }

        private string _releaseNo;
        public string ReleaseNo
        {
            get { return _releaseNo != null ? _releaseNo : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Release_No); }
            set { _releaseNo = value; }
        }
        private string _writer;
        public string Writer		  //User id of person taking the order
        {
            get { return _writer != null ? _writer : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Writer); }
            set { _writer = value; }
        }

        private string _orderBy;
        public string OrderBy
        {
            get { return _orderBy != null ? _orderBy : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Order_By); }
            set { _orderBy = value; }
        }

        private string _shipVia;
        public string ShipVia     // shipping method
        {
            get { return _shipVia != null ? _shipVia : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Ship_Via); }
            set { _shipVia = value; }
        }

        private Decimal? _freight;
        public Decimal? Freight
        {
            get { return _freight != null ? _freight : DataUtilities.GetHeaderValue<Decimal?>(_orderResult, OrderHeaderConstants.Freight); }
            set { _freight = value; }
        }

        private Decimal? _handling;
        public Decimal? Handling
        {
            get { return _handling != null ? _handling : DataUtilities.GetHeaderValue<Decimal?>(_orderResult, OrderHeaderConstants.Handling); }
            set { _handling = value; }
        }

        private Decimal? _tax;
        public Decimal? Tax
        {
            get { return _tax != null ? _tax : DataUtilities.GetHeaderValue<Decimal?>(_orderResult, OrderHeaderConstants.Tax); }
            set { _tax = value; }
        }


        private string _taxExemptNo;
        public string TaxExemptNo
        {
            get { return _taxExemptNo != null ? _taxExemptNo : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Tax_Exempt_No); }
            set { _taxExemptNo = value; }
        }

        private string _taxJurisdiction;
        public string TaxJurisdiction
        {
            get { return _taxJurisdiction != null ? _taxJurisdiction : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Tax_Jurisdiction); }
            set { _taxJurisdiction = value; }
        }

        private DateTime? _bidExpireDate;
        public DateTime? BidExpireDate
        {
            get { return _bidExpireDate != null ? _bidExpireDate : DataUtilities.GetHeaderValue<DateTime?>(_orderResult, OrderHeaderConstants.Bid_Expire_Date); }
            set { _bidExpireDate = value; }
        }

        private string _keywords;
        public string Keywords
        {
            get { return _keywords != null ? _keywords : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Keywords); }
            set { _keywords = value; }
        }

        private string _webOrderNo;
        public string WebOrderNo  // Website internal order number
        {
            get { return _webOrderNo != null ? _webOrderNo : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Web_Order_No); }
            set { _webOrderNo = value; }
        }

        private string _shippingInstr;
        public string ShippingInstr
        {
            get { return _shippingInstr != null ? _shippingInstr : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Shipping_Instr); }
            set { _shippingInstr = value; }
        }

        private string _internalNotes;
        public string InternalNotes
        {
            get { return _internalNotes != null ? _internalNotes : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Internal_Notes); }
            set { _internalNotes = value; }
        }

		//******************************************
		//Credit Card Block Info
		private string _elementAccountId;
		public string ElementAccountId
		{
			get { return _elementAccountId ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Element_Account_Id); }
			set { _elementAccountId = value; }
		}

		private string _cardType;
		public string CardType
		{
			get { return _cardType ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Card_Type); }
			set { _cardType = value; }
		}

		private string _cardNumber;
		public string CardNumber
		{
			get { return _cardNumber ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Card_Number); }
			set { _cardNumber = value; }
		}

		private string _cardHolder;
		public string CardHolder
		{
			get { return _cardHolder ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Card_Holder); }
			set { _cardHolder = value; }
		}

		private string _expireDate;
		public string ExpireDate
		{
			get { return _expireDate ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Expire_Date); }
			set { _expireDate = value; }
		}

		private string _authType;
		public string AuthType
		{
			get { return _authType ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Auth_Type); }
			set { _authType = value; }
		}

		private string _streetAddress;
		public string StreetAddress
		{
			get { return _streetAddress ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Street_Address); }
			set { _streetAddress = value; }
		}

		private string _postalCode;
		public string PostalCode
		{
			get { return _postalCode ?? DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Postal_Code); }
			set { _postalCode = value; }
		}
	
		//******************************************

        // Typically these are left undefined and the default values for the customer are used.
        public string AltPhoneNo { get; set; }
        public string AltSalesSource { get; set; }
        public string AltSalesperson { get; set; }
        public string AltSalespersonIn { get; set; }

        private string _altTerms;
        public string AltTerms
        {
            get { return _altTerms != null ? _altTerms : DataUtilities.GetHeaderValue<string>(_orderResult, OrderHeaderConstants.Terms); }
            set { _altTerms = value; }
        }

        // Shipping Address (Only needed if the normal ship-to customer address needs to be overridden)
        public string AltShippingPhoneNumber { get; set; }
        public string AltShippingName { get; set; }
        public IList<string> AltShippingAddress { get; set; }
        public string AltShippingCity { get; set; }
        public string AltShippingState { get; set; }
        public string AltShippingZip { get; set; }

        // Nav properties
        public IList<OrderDetailBase> OrderDetail { get; set; }
    }
}
