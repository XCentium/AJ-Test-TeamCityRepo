  



declare module Insite.Account.WebApi.V1.ApiModels {
	interface AccountModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		email: string;
		userName: string;
		password: string;
		isSubscribed: boolean;
		isGuest: boolean;
		canApproveOrders: boolean;
		canViewApprovalOrders: boolean;
		billToId: System.Guid;
		shipToId: System.Guid;
		firstName: string;
		lastName: string;
		role: string;
		approver: string;
		isApproved: boolean;
		defaultLocation: string;
		availableApprovers: string[];
		availableRoles: string[];
	}
	interface AccountSettingsModel extends Insite.Core.WebApi.BaseModel {
		allowCreateAccount: boolean;
		allowGuestCheckout: boolean;
		allowSubscribeToNewsLetter: boolean;
		requireSelectCustomerOnSignIn: boolean;
		passwordMinimumLength: number;
	}
	interface AccountCollectionModel extends Insite.Core.WebApi.BaseModel {
		accounts: Insite.Account.WebApi.V1.ApiModels.AccountModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
	}
	interface SessionModel extends Insite.Core.WebApi.BaseModel {
		isAuthenticated: boolean;
		hasRfqUpdates: boolean;
		userName: string;
		userLabel: string;
		userRoles: string;
		email: string;
		password: string;
		newPassword: string;
		resetPassword: boolean;
		displayChangeCustomerLink: boolean;
		redirectToChangeCustomerPageOnSignIn: boolean;
		billTo: Insite.Customers.WebApi.V1.ApiModels.BillToModel;
		shipTo: Insite.Customers.WebApi.V1.ApiModels.ShipToModel;
		language: Insite.Websites.WebApi.V1.ApiModels.LanguageModel;
		currency: Insite.Websites.WebApi.V1.ApiModels.CurrencyModel;
		deviceType: string;
		persona: string;
		dashboardIsHomepage: boolean;
		isSalesPerson: boolean;
		customLandingPage: string;
	}
	interface AccountShipToCollectionModel extends Insite.Core.WebApi.BaseModel {
		pagination: Insite.Core.WebApi.PaginationModel;
		userShipToCollection: Insite.Account.WebApi.V1.ApiModels.AccountShipToModel[];
		costCodeCollection: Insite.Account.Services.Dtos.CustomerCostCodeDto[];
	}
	interface AccountShipToModel {
		shipToNumber: string;
		city: string;
		state: string;
		address: string;
		assign: boolean;
		isDefaultShipTo: boolean;
		costCode: string;
	}
}
declare module Insite.Core.WebApi {
	interface BaseModel {
		uri: string;
		properties: {[key: string]:  string};
	}
	interface PaginationModel {
		currentPage: number;
		pageSize: number;
		defaultPageSize: number;
		totalItemCount: number;
		numberOfPages: number;
		pageSizeOptions: number[];
		sortOptions: Insite.Core.WebApi.SortOptionModel[];
		sortType: string;
		nextPageUri: string;
		prevPageUri: string;
	}
	interface SortOptionModel {
		displayName: string;
		sortType: string;
	}
}
declare module System.Collections.Generic {
	interface KeyValuePair<TKey, TValue> {
		key: TKey;
		value: TValue;
	}
}
declare module System {
	interface Guid {
	}
	interface Tuple<T1, T2> {
		item1: T1;
		item2: T2;
	}
}
declare module Insite.Customers.WebApi.V1.ApiModels {
	interface BillToModel extends Insite.Customers.WebApi.V1.ApiModels.BaseAddressModel {
		shipTosUri: string;
		isGuest: boolean;
		email: string;
		label: string;
		budgetEnforcementLevel: string;
		costCodeTitle: string;
		customerCurrencySymbol: string;
		costCodes: Insite.Customers.WebApi.V1.ApiModels.CostCodeModel[];
		shipTos: Insite.Customers.WebApi.V1.ApiModels.ShipToModel[];
		validation: Insite.Customers.Services.Dtos.CustomerValidationDto;
		isDefault: boolean;
	}
	interface BaseAddressModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		customerNumber: string;
		customerSequence: string;
		customerName: string;
		firstName: string;
		lastName: string;
		companyName: string;
		address1: string;
		address2: string;
		city: string;
		postalCode: string;
		state: Insite.Websites.WebApi.V1.ApiModels.StateModel;
		country: Insite.Websites.WebApi.V1.ApiModels.CountryModel;
		phone: string;
		fullAddress: string;
	}
	interface CostCodeModel {
		id: System.Guid;
		costCode: string;
		description: string;
		isActive: boolean;
	}
	interface ShipToModel extends Insite.Customers.WebApi.V1.ApiModels.BaseAddressModel {
		isNew: boolean;
		label: string;
		validation: Insite.Customers.Services.Dtos.CustomerValidationDto;
	}
	interface BillToCollectionModel extends Insite.Core.WebApi.BaseModel {
		pagination: Insite.Core.WebApi.PaginationModel;
		billTos: Insite.Customers.WebApi.V1.ApiModels.BillToModel[];
	}
	interface ShipToCollectionModel extends Insite.Core.WebApi.BaseModel {
		pagination: Insite.Core.WebApi.PaginationModel;
		shipTos: Insite.Customers.WebApi.V1.ApiModels.ShipToModel[];
	}
}
declare module Insite.Websites.WebApi.V1.ApiModels {
	interface StateModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		name: string;
		abbreviation: string;
	}
	interface CountryModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		name: string;
		abbreviation: string;
		states: Insite.Websites.WebApi.V1.ApiModels.StateModel[];
	}
	interface LanguageModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		languageCode: string;
		cultureCode: string;
		description: string;
		imageFilePath: string;
		isDefault: boolean;
		isLive: boolean;
	}
	interface CurrencyModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		currencyCode: string;
		description: string;
		currencySymbol: string;
		isDefault: boolean;
	}
	interface WebsiteModel extends Insite.Core.WebApi.BaseModel {
		countriesUri: string;
		statesUri: string;
		languagesUri: string;
		currenciesUri: string;
		id: string;
		name: string;
		description: string;
		isActive: boolean;
		isRestricted: boolean;
		countries: Insite.Websites.WebApi.V1.ApiModels.CountryCollectionModel;
		states: Insite.Websites.WebApi.V1.ApiModels.StateCollectionModel;
		languages: Insite.Websites.WebApi.V1.ApiModels.LanguageCollectionModel;
		currencies: Insite.Websites.WebApi.V1.ApiModels.CurrencyCollectionModel;
	}
	interface CountryCollectionModel extends Insite.Core.WebApi.BaseModel {
		countries: Insite.Websites.WebApi.V1.ApiModels.CountryModel[];
	}
	interface StateCollectionModel extends Insite.Core.WebApi.BaseModel {
		states: Insite.Websites.WebApi.V1.ApiModels.StateModel[];
	}
	interface LanguageCollectionModel extends Insite.Core.WebApi.BaseModel {
		languages: Insite.Websites.WebApi.V1.ApiModels.LanguageModel[];
	}
	interface CurrencyCollectionModel extends Insite.Core.WebApi.BaseModel {
		currencies: Insite.Websites.WebApi.V1.ApiModels.CurrencyModel[];
	}
}
declare module Insite.Customers.Services.Dtos {
	interface CustomerValidationDto {
		firstName: Insite.Customers.Services.Dtos.FieldValidationDto;
		lastName: Insite.Customers.Services.Dtos.FieldValidationDto;
		companyName: Insite.Customers.Services.Dtos.FieldValidationDto;
		address1: Insite.Customers.Services.Dtos.FieldValidationDto;
		address2: Insite.Customers.Services.Dtos.FieldValidationDto;
		country: Insite.Customers.Services.Dtos.FieldValidationDto;
		state: Insite.Customers.Services.Dtos.FieldValidationDto;
		city: Insite.Customers.Services.Dtos.FieldValidationDto;
		postalCode: Insite.Customers.Services.Dtos.FieldValidationDto;
		phone: Insite.Customers.Services.Dtos.FieldValidationDto;
		email: Insite.Customers.Services.Dtos.FieldValidationDto;
	}
	interface FieldValidationDto {
		isRequired: boolean;
		isDisabled: boolean;
		maxLength: number;
	}
}
declare module Insite.Account.Services.Dtos {
	interface CustomerCostCodeDto {
		customerCostCodeId: System.Guid;
		costCode: string;
		description: string;
		isActive: boolean;
	}
}
declare module Insite.Budget.WebApi.V1.ApiModels {
	interface BudgetModel extends Insite.Core.WebApi.BaseModel {
		fiscalYear: number;
		fiscalYearEndDate: Date;
		budgetLineCollection: Insite.Budget.WebApi.V1.ApiModels.BudgetLineModel[];
		userProfileId: string;
		shipToId: string;
	}
	interface BudgetLineModel extends Insite.Core.WebApi.BaseModel {
		period: number;
		startDate: Date;
		currentFiscalYearBudget: number;
		currentFiscalYearBudgetDisplay: string;
		currentFiscalYearActual: number;
		currentFiscalYearActualDisplay: string;
		currentFiscalYearVariance: number;
		currentFiscalYearVarianceDisplay: string;
		lastFiscalYearBudget: number;
		lastFiscalYearBudgetDisplay: string;
		lastFiscalYearActual: number;
		lastFiscalYearActualDisplay: string;
		lastFiscalYearVariance: number;
		lastFiscalYearVarianceDisplay: string;
	}
	interface BudgetCalendarModel extends Insite.Core.WebApi.BaseModel {
		fiscalYear: number;
		fiscalYearEndDate: Date;
		budgetPeriods: Date[];
	}
}
declare module Insite.Cart.WebApi.V1.ApiModels {
	interface CartCollectionModel extends Insite.Core.WebApi.BaseModel {
		carts: Insite.Cart.WebApi.V1.ApiModels.CartModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
	}
	interface CartModel extends Insite.Core.WebApi.BaseModel {
		cartLinesUri: string;
		id: string;
		status: string;
		statusDisplay: string;
		type: string;
		typeDisplay: string;
		orderNumber: string;
		orderDate: Date;
		billTo: Insite.Customers.WebApi.V1.ApiModels.BillToModel;
		shipTo: Insite.Customers.WebApi.V1.ApiModels.ShipToModel;
		userLabel: string;
		userRoles: string;
		shipToLabel: string;
		notes: string;
		carrier: Insite.Cart.Services.Dtos.CarrierDto;
		shipVia: Insite.Cart.Services.Dtos.ShipViaDto;
		paymentMethod: Insite.Cart.Services.Dtos.PaymentMethodDto;
		poNumber: string;
		promotionCode: string;
		initiatedByUserName: string;
		totalQtyOrdered: number;
		lineCount: number;
		totalCountDisplay: number;
		quoteRequiredCount: number;
		orderSubTotal: number;
		orderSubTotalDisplay: string;
		orderSubTotalWithOutProductDiscounts: number;
		orderSubTotalWithOutProductDiscountsDisplay: string;
		totalTax: number;
		totalTaxDisplay: string;
		shippingAndHandling: number;
		shippingAndHandlingDisplay: string;
		orderGrandTotal: number;
		orderGrandTotalDisplay: string;
		costCodeLabel: string;
		isAuthenticated: boolean;
		isSalesperson: boolean;
		isSubscribed: boolean;
		requiresPoNumber: boolean;
		displayContinueShoppingLink: boolean;
		canModifyOrder: boolean;
		canSaveOrder: boolean;
		canBypassCheckoutAddress: boolean;
		canRequisition: boolean;
		canRequestQuote: boolean;
		canEditCostCode: boolean;
		showTaxAndShipping: boolean;
		showLineNotes: boolean;
		showCostCode: boolean;
		showNewsletterSignup: boolean;
		showPoNumber: boolean;
		showCreditCard: boolean;
		showPayPal: boolean;
		isAwaitingApproval: boolean;
		requiresApproval: boolean;
		approverReason: string;
		salespersonName: string;
		paymentOptions: Insite.Cart.Services.Dtos.PaymentOptionsDto;
		costCodes: Insite.Cart.Services.Dtos.CostCodeDto[];
		carriers: Insite.Cart.Services.Dtos.CarrierDto[];
		cartLines: Insite.Cart.WebApi.V1.ApiModels.CartLineModel[];
		canCheckOut: boolean;
		hasInsufficientInventory: boolean;
	}
	interface CartLineModel extends Insite.Core.WebApi.BaseModel {
		productUri: string;
		id: string;
		line: number;
		productId: System.Guid;
		requisitionId: System.Guid;
		smallImagePath: string;
		altText: string;
		productName: string;
		manufacturerItem: string;
		customerName: string;
		shortDescription: string;
		erpNumber: string;
		unitOfMeasure: string;
		unitOfMeasureDisplay: string;
		baseUnitOfMeasure: string;
		baseUnitOfMeasureDisplay: string;
		qtyPerBaseUnitOfMeasure: number;
		costCode: string;
		notes: string;
		qtyOrdered: number;
		qtyLeft: number;
		pricing: Insite.Catalog.Services.Dtos.ProductPriceDto;
		isPromotionItem: boolean;
		isDiscounted: boolean;
		isFixedConfiguration: boolean;
		quoteRequired: boolean;
		breakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		sectionOptions: Insite.Cart.Services.Dtos.SectionOptionDto[];
		availability: Insite.Catalog.Services.Dtos.AvailabilityDto;
		qtyOnHand: number;
		canAddToCart: boolean;
		isQtyAdjusted: boolean;
		hasInsufficientInventory: boolean;
		canBackOrder: boolean;
	}
	interface CartLineCollectionModel extends Insite.Core.WebApi.BaseModel {
		cartLines: Insite.Cart.WebApi.V1.ApiModels.CartLineModel[];
	}
	interface CartSettingsModel extends Insite.Core.WebApi.BaseModel {
		canRequisition: boolean;
		canEditCostCode: boolean;
		showCostCode: boolean;
		showPoNumber: boolean;
		showPayPal: boolean;
		showCreditCard: boolean;
		showTaxAndShipping: boolean;
		showLineNotes: boolean;
		showNewsletterSignup: boolean;
		requiresPoNumber: boolean;
	}
}
declare module Insite.Cart.Services.Dtos {
	interface CarrierDto {
		id: System.Guid;
		description: string;
		shipVias: Insite.Cart.Services.Dtos.ShipViaDto[];
	}
	interface ShipViaDto {
		id: System.Guid;
		description: string;
		isDefault: boolean;
	}
	interface PaymentMethodDto {
		name: string;
		description: string;
		isCreditCard: boolean;
		isPaymentProfile: boolean;
	}
	interface PaymentOptionsDto {
		paymentMethods: Insite.Cart.Services.Dtos.PaymentMethodDto[];
		cardTypes: {[key: string]:  string};
		expirationMonths: {[key: string]:  number};
		expirationYears: {[key: number]:  number};
		creditCard: Insite.Core.Plugins.PaymentGateway.Dtos.CreditCardDto;
		canStorePaymentProfile: boolean;
		storePaymentProfile: boolean;
		isPayPal: boolean;
		payPalPayerId: string;
		payPalToken: string;
		payPalPaymentUrl: string;
	}
	interface CostCodeDto {
		costCode: string;
		description: string;
	}
	interface SectionOptionDto {
		sectionOptionId: System.Guid;
		sectionName: string;
		optionName: string;
	}
}
declare module Insite.Core.Plugins.PaymentGateway.Dtos {
	interface CreditCardDto {
		cardType: string;
		cardHolderName: string;
		cardNumber: string;
		expirationMonth: number;
		expirationYear: number;
		securityCode: string;
	}
}
declare module Insite.Catalog.Services.Dtos {
	interface ProductPriceDto {
		productId: System.Guid;
		regularPrice: number;
		regularPriceDisplay: string;
		extendedRegularPrice: number;
		extendedRegularPriceDisplay: string;
		actualPrice: number;
		actualPriceDisplay: string;
		extendedActualPrice: number;
		extendedActualPriceDisplay: string;
		unitCost: number;
		unitCostDisplay: string;
		isOnSale: boolean;
		regularBreakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		actualBreakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		additionalResults: {[key: string]:  string};
	}
	interface BreakPriceDto {
		breakQty: number;
		breakPrice: number;
		breakPriceDisplay: string;
		savingsMessage: string;
	}
	interface AvailabilityDto {
	}
	interface ProductDto {
		id: System.Guid;
		name: string;
		customerName: string;
		shortDescription: string;
		erpNumber: string;
		erpDescription: string;
		urlSegment: string;
		basicListPrice: number;
		basicSalePrice: number;
		basicSaleStartDate: Date;
		basicSaleEndDate: Date;
		smallImagePath: string;
		mediumImagePath: string;
		largeImagePath: string;
		pricing: Insite.Catalog.Services.Dtos.ProductPriceDto;
		qtyOnHand: number;
		isConfigured: boolean;
		isFixedConfiguration: boolean;
		isActive: boolean;
		isHazardousGood: boolean;
		isDiscontinued: boolean;
		isSpecialOrder: boolean;
		isGiftCard: boolean;
		isBeingCompared: boolean;
		isSponsored: boolean;
		quoteRequired: boolean;
		manufacturerItem: string;
		packDescription: string;
		altText: string;
		customerUnitOfMeasure: string;
		canBackOrder: boolean;
		trackInventory: boolean;
		multipleSaleQty: number;
		htmlContent: string;
		productCode: string;
		priceCode: string;
		sku: string;
		upcCode: string;
		modelNumber: string;
		taxCode1: string;
		taxCode2: string;
		taxCategory: string;
		shippingClassification: string;
		shippingLength: string;
		shippingWidth: string;
		shippingHeight: string;
		shippingWeight: string;
		qtyPerShippingPackage: number;
		shippingAmountOverride: number;
		handlingAmountOverride: number;
		metaDescription: string;
		metaKeywords: string;
		pageTitle: string;
		allowAnyGiftCardAmount: boolean;
		sortOrder: number;
		hasMsds: boolean;
		unspsc: string;
		roundingRule: string;
		vendorNumber: string;
		configurationDto: Insite.Catalog.Services.Dtos.LegacyConfigurationDto;
		unitOfMeasure: string;
		unitOfMeasureDisplay: string;
		selectedUnitOfMeasure: string;
		selectedUnitOfMeasureDisplay: string;
		productDetailUrl: string;
		canAddToCart: boolean;
		allowedAddToCart: boolean;
		canAddToWishlist: boolean;
		canViewDetails: boolean;
		canShowPrice: boolean;
		canShowUnitOfMeasure: boolean;
		canEnterQuantity: boolean;
		canConfigure: boolean;
		isStyleProductParent: boolean;
		numberInCart: number;
		qtyOrdered: number;
		availability: Insite.Catalog.Services.Dtos.AvailabilityDto;
		styleTraits: Insite.Catalog.Services.Dtos.StyleTraitDto[];
		styledProducts: Insite.Catalog.Services.Dtos.StyledProductDto[];
		attributeTypes: Insite.Catalog.Services.Dtos.AttributeTypeDto[];
		documents: Insite.Catalog.Services.Dtos.DocumentDto[];
		specifications: Insite.Catalog.Services.Dtos.SpecificationDto[];
		crossSells: Insite.Catalog.Services.Dtos.ProductDto[];
		accessories: Insite.Catalog.Services.Dtos.ProductDto[];
		productUnitOfMeasures: Insite.Catalog.Services.Dtos.ProductUnitOfMeasureDto[];
		properties: {[key: string]:  string};
		score: number;
		searchBoost: number;
	}
	interface LegacyConfigurationDto {
		sections: Insite.Catalog.Services.Dtos.ConfigSectionDto[];
		hasDefaults: boolean;
		isKit: boolean;
	}
	interface ConfigSectionDto {
		sectionName: string;
		options: Insite.Catalog.Services.Dtos.ConfigSectionOptionDto[];
	}
	interface ConfigSectionOptionDto {
		sectionOptionId: System.Guid;
		sectionName: string;
		productName: string;
		productId: System.Guid;
		description: string;
		price: number;
		userProductPrice: boolean;
		selected: boolean;
		sortOrder: number;
	}
	interface StyleTraitDto {
		styleTraitId: System.Guid;
		name: string;
		nameDisplay: string;
		unselectedValue: string;
		sortOrder: number;
		styleValues: Insite.Catalog.Services.Dtos.StyleValueDto[];
	}
	interface StyleValueDto {
		styleTraitName: string;
		styleTraitId: System.Guid;
		styleTraitValueId: System.Guid;
		value: string;
		valueDisplay: string;
		sortOrder: number;
		isDefault: boolean;
	}
	interface StyledProductDto {
		productId: System.Guid;
		name: string;
		shortDescription: string;
		erpNumber: string;
		mediumImagePath: string;
		smallImagePath: string;
		largeImagePath: string;
		qtyOnHand: number;
		numberInCart: number;
		pricing: Insite.Catalog.Services.Dtos.ProductPriceDto;
		quoteRequired: boolean;
		styleValues: Insite.Catalog.Services.Dtos.StyleValueDto[];
		availability: Insite.Catalog.Services.Dtos.AvailabilityDto;
	}
	interface ProductUnitOfMeasureDto {
		productUnitOfMeasureId: System.Guid;
		unitOfMeasure: string;
		unitOfMeasureDisplay: string;
		description: string;
		qtyPerBaseUnitOfMeasure: number;
		roundingRule: string;
		isDefault: boolean;
	}
	interface AttributeTypeDto {
		id: System.Guid;
		name: string;
		label: string;
		isFilter: boolean;
		isComparable: boolean;
		isActive: boolean;
		sortOrder: number;
		attributeValues: Insite.Catalog.Services.Dtos.AttributeValueDto[];
	}
	interface AttributeValueDto {
		id: System.Guid;
		value: string;
		valueDisplay: string;
		sortOrder: number;
		isActive: boolean;
	}
	interface DocumentDto {
		documentId: System.Guid;
		name: string;
		description: string;
		created: Date;
		filePath: string;
		fileName: string;
		fileUrl: string;
		fullPathName: string;
		documentType: string;
		languageCode: string;
		fileTypeString: string;
	}
	interface SpecificationDto {
		specificationId: System.Guid;
		name: string;
		nameDisplay: string;
		value: string;
		description: string;
		sortOrder: number;
		isActive: boolean;
		parentSpecification: Insite.Catalog.Services.Dtos.SpecificationDto;
		htmlContent: string;
		specifications: Insite.Catalog.Services.Dtos.SpecificationDto[];
	}
}
declare module Insite.OrderApproval.WebApi.V1.ApiModels {
	interface OrderApprovalCollectionModel extends Insite.Core.WebApi.BaseModel {
		cartCollection: Insite.Cart.WebApi.V1.ApiModels.CartModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
	}
}
declare module Insite.Catalog.WebApi.V1.ApiModels {
	interface AutocompleteModel extends Insite.Core.WebApi.BaseModel {
		categories: Insite.Catalog.WebApi.V1.ApiModels.AutocompleteItemModel[];
		products: Insite.Catalog.WebApi.V1.ApiModels.ProductAutocompleteItemModel[];
		content: Insite.Catalog.WebApi.V1.ApiModels.AutocompleteItemModel[];
	}
	interface AutocompleteItemModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		image: string;
		subtitle: string;
		title: string;
		url: string;
	}
	interface ProductAutocompleteItemModel extends Insite.Catalog.WebApi.V1.ApiModels.AutocompleteItemModel {
		manufacturerItemNumber: string;
		name: string;
		isNameCustomerOverride: boolean;
	}
	interface ProductModel extends Insite.Core.WebApi.BaseModel {
		product: Insite.Catalog.Services.Dtos.ProductDto;
	}
	interface ProductCollectionModel extends Insite.Core.WebApi.BaseModel {
		pagination: Insite.Core.WebApi.PaginationModel;
		products: Insite.Catalog.Services.Dtos.ProductDto[];
		categoryFacets: Insite.Core.Plugins.Search.Dtos.CategoryFacetDto[];
		attributeTypeFacets: Insite.Core.Plugins.Search.Dtos.AttributeTypeFacetDto[];
		didYouMeanSuggestions: Insite.Core.Plugins.Search.Dtos.SuggestionDto[];
		priceRange: Insite.Core.Plugins.Search.Dtos.PriceRangeDto;
		exactMatch: boolean;
		notAllProductsFound: boolean;
		notAllProductsAllowed: boolean;
		originalQuery: string;
		correctedQuery: string;
	}
	interface AutocompleteProductModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		name: string;
		erpNumber: string;
		shortDescription: string;
		productDetailUrl: string;
		smallImagePath: string;
	}
	interface AutocompleteProductCollectionModel extends Insite.Core.WebApi.BaseModel {
		products: Insite.Catalog.WebApi.V1.ApiModels.AutocompleteProductModel[];
	}
	interface CrossSellCollectionModel extends Insite.Core.WebApi.BaseModel {
		products: Insite.Catalog.Services.Dtos.ProductDto[];
	}
	interface CatalogPageModel extends Insite.Core.WebApi.BaseModel {
		category: Insite.Catalog.WebApi.V1.ApiModels.CategoryModel;
		productId: System.Guid;
		productName: string;
		title: string;
		metaDescription: string;
		metaKeywords: string;
		canonicalPath: string;
		breadCrumbs: Insite.Catalog.WebApi.V1.ApiModels.BreadCrumbModel[];
		obsoletePath: boolean;
	}
	interface CategoryModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		name: string;
		shortDescription: string;
		urlSegment: string;
		smallImagePath: string;
		largeImagePath: string;
		imageAltText: string;
		activateOn: Date;
		deactivateOn: Date;
		metaKeywords: string;
		metaDescription: string;
		htmlContent: string;
		sortOrder: number;
		isFeatured: boolean;
		isDynamic: boolean;
		subCategories: Insite.Catalog.WebApi.V1.ApiModels.CategoryModel[];
		path: string;
	}
	interface BreadCrumbModel {
		text: string;
		url: string;
	}
	interface CategoryCollectionModel extends Insite.Core.WebApi.BaseModel {
		categories: Insite.Catalog.WebApi.V1.ApiModels.CategoryModel[];
	}
	interface ProductPriceModel extends Insite.Core.WebApi.BaseModel {
		productId: System.Guid;
		regularPrice: number;
		regularPriceDisplay: string;
		extendedRegularPrice: number;
		extendedRegularPriceDisplay: string;
		actualPrice: number;
		actualPriceDisplay: string;
		extendedActualPrice: number;
		extendedActualPriceDisplay: string;
		unitCost: number;
		unitCostDisplay: string;
		isOnSale: boolean;
		quoteRequired: boolean;
		regularBreakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		actualBreakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		additionalResults: {[key: string]:  string};
	}
	interface ProductSettingsModel extends Insite.Core.WebApi.BaseModel {
		allowBackOrder: boolean;
		showInventoryAvailability: boolean;
		showAddToCartConfirmationDialog: boolean;
		enableProductComparisons: boolean;
		alternateUnitsOfMeasure: boolean;
		thirdPartyReviews: string;
		defaultViewType: string;
	}
}
declare module Insite.Core.Plugins.Search.Dtos {
	interface CategoryFacetDto {
		categoryId: System.Guid;
		websiteId: System.Guid;
		shortDescription: string;
		count: number;
		selected: boolean;
		subCategoryDtos: Insite.Core.Plugins.Search.Dtos.CategoryFacetDto[];
	}
	interface AttributeTypeFacetDto {
		attributeTypeId: System.Guid;
		name: string;
		nameDisplay: string;
		sort: number;
		attributeValueFacets: Insite.Core.Plugins.Search.Dtos.AttributeValueFacetDto[];
	}
	interface AttributeValueFacetDto {
		attributeValueId: System.Guid;
		value: string;
		valueDisplay: string;
		count: number;
		sortOrder: number;
		selected: boolean;
	}
	interface SuggestionDto {
		highlightedSuggestion: string;
		score: number;
		suggestion: string;
	}
	interface PriceRangeDto {
		minimumPrice: number;
		maximumPrice: number;
		count: number;
		priceFacets: Insite.Core.Plugins.Search.Dtos.PriceFacetDto[];
	}
	interface PriceFacetDto {
		minimumPrice: number;
		maximumPrice: number;
		count: number;
		selected: boolean;
	}
}
declare module Insite.Dashboard.WepApi.V1.ApiModels {
	interface DashboardPanelCollectionModel extends Insite.Core.WebApi.BaseModel {
		dashboardPanels: Insite.Dashboard.WepApi.V1.ApiModels.DashboardPanelModel[];
	}
	interface DashboardPanelModel {
		text: string;
		quickLinkText: string;
		url: string;
		count: number;
		isPanel: boolean;
		isQuickLink: boolean;
		panelType: string;
		order: number;
		quickLinkOrder: number;
	}
}
declare module Insite.Dealers.WebApi.V1.ApiModels {
	interface DealerModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		name: string;
		address1: string;
		address2: string;
		city: string;
		state: string;
		postalCode: string;
		countryId: System.Guid;
		phone: string;
		latitude: number;
		longitude: number;
		webSiteUrl: string;
		htmlContent: string;
		distance: number;
		distanceUnitOfMeasure: string;
	}
	interface DealerCollectionModel extends Insite.Core.WebApi.BaseModel {
		dealers: Insite.Dealers.WebApi.V1.ApiModels.DealerModel[];
		distanceUnitOfMeasure: string;
		pagination: Insite.Core.WebApi.PaginationModel;
		defaultLatitude: number;
		defaultLongitude: number;
		formattedAddress: string;
		defaultRadius: number;
		startDealerNumber: number;
	}
}
declare module Insite.IdentityServer.Models {
	interface ExternalProviderLinkCollectionModel {
		externalProviders: Insite.IdentityServer.Models.ExternalProviderLinkModel[];
	}
	interface ExternalProviderLinkModel {
		caption: string;
		url: string;
	}
}
declare module Insite.Invoice.WebApi.V1.ApiModels {
	interface InvoiceModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		invoiceNumber: string;
		invoiceDate: Date;
		dueDate: Date;
		invoiceType: string;
		customerNumber: string;
		customerSequence: string;
		customerPO: string;
		status: string;
		isOpen: boolean;
		currencyCode: string;
		terms: string;
		shipCode: string;
		salesperson: string;
		btCompanyName: string;
		btAddress1: string;
		btAddress2: string;
		billToCity: string;
		billToState: string;
		billToPostalCode: string;
		btCountry: string;
		stCompanyName: string;
		stAddress1: string;
		stAddress2: string;
		shipToCity: string;
		shipToState: string;
		shipToPostalCode: string;
		stCountry: string;
		notes: string;
		productTotal: number;
		discountAmount: number;
		shippingAndHandling: number;
		otherCharges: number;
		taxAmount: number;
		invoiceTotal: number;
		currentBalance: number;
		invoiceLines: Insite.Invoice.WebApi.V1.ApiModels.InvoiceLineModel[];
		invoiceTotalDisplay: string;
		productTotalDisplay: string;
		discountAmountDisplay: string;
		taxAmountDisplay: string;
		shippingAndHandlingDisplay: string;
		otherChargesDisplay: string;
		currentBalanceDisplay: string;
		orderTotalDisplay: string;
	}
	interface InvoiceLineModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		productUri: string;
		mediumImagePath: string;
		altText: string;
		productName: string;
		manufacturerItem: string;
		customerName: string;
		shortDescription: string;
		productERPNumber: string;
		customerProductNumber: string;
		lineType: string;
		erpOrderNumber: string;
		lineNumber: string;
		releaseNumber: number;
		linePOReference: string;
		description: string;
		warehouse: string;
		notes: string;
		qtyInvoiced: number;
		unitOfMeasure: string;
		unitPrice: number;
		discountPercent: number;
		discountAmount: number;
		lineTotal: number;
		shipmentNumber: string;
		unitPriceDisplay: string;
		discountAmountDisplay: string;
		lineTotalDisplay: string;
	}
	interface InvoiceCollectionModel extends Insite.Core.WebApi.BaseModel {
		invoices: Insite.Invoice.WebApi.V1.ApiModels.InvoiceModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
		showErpOrderNumber: boolean;
	}
}
declare module Insite.Promotions.WebApi.V1.ApiModels {
	interface PromotionModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		promotionCode: string;
		name: string;
		amount: number;
		amountDisplay: string;
		promotionApplied: boolean;
		message: string;
	}
	interface PromotionCollectionModel extends Insite.Core.WebApi.BaseModel {
		promotions: Insite.Promotions.WebApi.V1.ApiModels.PromotionModel[];
	}
}
declare module Insite.Message.WebApi.V1.ApiModels {
	interface MessageCollectionModel extends Insite.Core.WebApi.BaseModel {
		messages: Insite.Message.WebApi.V1.ApiModels.MessageModel[];
	}
	interface MessageModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		body: string;
		subject: string;
		dateToDisplay: Date;
		isRead: boolean;
	}
}
declare module Insite.Order.WebApi.V1.ApiModels {
	interface OrderCollectionModel extends Insite.Core.WebApi.BaseModel {
		orders: Insite.Order.WebApi.V1.ApiModels.OrderModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
		showErpOrderNumber: boolean;
	}
	interface OrderModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		erpOrderNumber: string;
		webOrderNumber: string;
		orderDate: Date;
		status: string;
		customerNumber: string;
		customerSequence: string;
		customerPO: string;
		currencyCode: string;
		terms: string;
		shipCode: string;
		salesperson: string;
		btCompanyName: string;
		btAddress1: string;
		btAddress2: string;
		billToCity: string;
		billToState: string;
		billToPostalCode: string;
		btCountry: string;
		stCompanyName: string;
		stAddress1: string;
		stAddress2: string;
		shipToCity: string;
		shipToState: string;
		shipToPostalCode: string;
		stCountry: string;
		notes: string;
		productTotal: number;
		discountAmount: number;
		shippingAndHandling: number;
		otherCharges: number;
		taxAmount: number;
		orderTotal: number;
		modifyDate: Date;
		orderLines: Insite.Order.WebApi.V1.ApiModels.OrderLineModel[];
		shipmentPackages: Insite.Order.Services.Dtos.ShipmentPackageDto[];
		returnReasons: string[];
		productTotalDisplay: string;
		orderTotalDisplay: string;
		discountAmountDisplay: string;
		taxAmountDisplay: string;
		shippingAndHandlingDisplay: string;
		otherChargesDisplay: string;
		canAddToCart: boolean;
		canAddAllToCart: boolean;
	}
	interface OrderLineModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		productId: string;
		productUri: string;
		mediumImagePath: string;
		altText: string;
		productName: string;
		manufacturerItem: string;
		customerName: string;
		shortDescription: string;
		productErpNumber: string;
		customerProductNumber: string;
		requiredDate: Date;
		lastShipDate: Date;
		customerNumber: string;
		customerSequence: string;
		lineType: string;
		status: string;
		lineNumber: number;
		releaseNumber: number;
		linePOReference: string;
		description: string;
		warehouse: string;
		notes: string;
		qtyOrdered: number;
		qtyShipped: number;
		unitOfMeasure: string;
		availability: Insite.Catalog.Services.Dtos.AvailabilityDto;
		inventoryQtyOrdered: number;
		inventoryQtyShipped: number;
		unitPrice: number;
		discountPercent: number;
		discountAmount: number;
		promotionAmountApplied: number;
		lineTotal: number;
		returnReason: string;
		rmaQtyRequested: number;
		rmaQtyReceived: number;
		unitPriceDisplay: string;
		discountAmountDisplay: string;
		promotionAmountAppliedDisplay: string;
		lineTotalDisplay: string;
		costCode: string;
		canAddToCart: boolean;
		isActiveProduct: boolean;
		sectionOptions: Insite.Order.Services.Dtos.SectionOptionDto[];
	}
	interface OrderSettingsModel extends Insite.Core.WebApi.BaseModel {
		allowCancellationRequest: boolean;
		canReorderItems: boolean;
		canOrderUpload: boolean;
	}
	interface RmaModel extends Insite.Core.WebApi.BaseModel {
		orderNumber: string;
		notes: string;
		message: string;
		rmaLines: Insite.Order.Services.Dtos.RmaLineDto[];
	}
}
declare module Insite.Order.Services.Dtos {
	interface SectionOptionDto {
		sectionOptionId: System.Guid;
		sectionName: string;
		optionName: string;
	}
	interface ShipmentPackageDto {
		shipmentDate: Date;
		carrier: string;
		shipVia: string;
		trackingUrl: string;
		trackingNumber: string;
		packSlip: string;
	}
	interface RmaLineDto {
		line: number;
		rmaQtyRequested: number;
		rmaReasonCode: string;
	}
}
declare module Insite.Requisition.WebApi.V1.ApiModels {
	interface RequisitionCollectionModel extends Insite.Core.WebApi.BaseModel {
		requisitions: Insite.Requisition.WebApi.V1.ApiModels.RequisitionModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
	}
	interface RequisitionModel extends Insite.Cart.WebApi.V1.ApiModels.CartLineModel {
		requisitionLinesUri: string;
		isApproved: boolean;
		requisitionLineCollection: Insite.Requisition.WebApi.V1.ApiModels.RequisitionLineCollectionModel;
	}
	interface RequisitionLineCollectionModel extends Insite.Core.WebApi.BaseModel {
		requisitionLines: Insite.Requisition.WebApi.V1.ApiModels.RequisitionLineModel[];
		pagination: Insite.Core.WebApi.PaginationModel;
	}
	interface RequisitionLineModel extends Insite.Core.WebApi.BaseModel {
		id: string;
		costCode: string;
		firstName: string;
		lastName: string;
		userName: string;
		orderDate: Date;
		qtyOrdered: number;
	}
}
declare module Insite.Rfq.WebApi.V1.ApiModels {
	interface QuoteModel extends Insite.Cart.WebApi.V1.ApiModels.CartModel {
		quoteLinesUri: string;
		quoteNumber: string;
		expirationDate: Date;
		customerNumber: string;
		customerName: string;
		shipToFullAddress: string;
		quoteLineCollection: Insite.Rfq.WebApi.V1.ApiModels.QuoteLineModel[];
		userName: string;
		isEditable: boolean;
		messageCollection: Insite.Rfq.WebApi.V1.ApiModels.MessageModel[];
		calculationMethods: Insite.Rfq.WebApi.V1.ApiModels.CalculationMethod[];
		isJobQuote: boolean;
		jobName: string;
	}
	interface QuoteLineModel extends Insite.Cart.WebApi.V1.ApiModels.CartLineModel {
		pricingRfq: Insite.Rfq.WebApi.V1.ApiModels.PricingRfqModel;
		maxQty: number;
	}
	interface PricingRfqModel extends Insite.Core.WebApi.BaseModel {
		unitCost: number;
		unitCostDisplay: string;
		listPrice: number;
		listPriceDisplay: string;
		customerPrice: number;
		customerPriceDisplay: string;
		minimumPriceAllowed: number;
		minimumPriceAllowedDisplay: string;
		maxDiscountPct: number;
		minMarginAllowed: number;
		showListPrice: boolean;
		showCustomerPrice: boolean;
		showUnitCost: boolean;
		priceBreaks: Insite.Rfq.WebApi.V1.ApiModels.BreakPriceRfqModel[];
		calculationMethods: Insite.Rfq.WebApi.V1.ApiModels.CalculationMethod[];
		validationMessages: {[key: string]:  string};
	}
	interface BreakPriceRfqModel {
		startQty: number;
		startQtyDisplay: string;
		endQty: number;
		endQtyDisplay: string;
		price: number;
		priceDispaly: string;
		percent: number;
		calculationMethod: string;
	}
	interface CalculationMethod {
		value: string;
		name: string;
		displayName: string;
		maximumDiscount: string;
		minimumMargin: string;
	}
	interface MessageModel extends Insite.Core.WebApi.BaseModel {
		quoteId: System.Guid;
		message: string;
		displayName: string;
		body: string;
	}
	interface QuoteSettingsModel extends Insite.Core.WebApi.BaseModel {
		jobQuoteEnabled: boolean;
		quoteExpireDays: number;
	}
}
declare module Insite.WishLists.WebApi.V1.ApiModels {
	interface WishListCollectionModel extends Insite.Core.WebApi.BaseModel {
		wishListCollection: Insite.WishLists.WebApi.V1.ApiModels.WishListModel[];
	}
	interface WishListModel extends Insite.Core.WebApi.BaseModel {
		wishListLinesUri: string;
		id: string;
		name: string;
		canAddAllToCart: boolean;
		canAddToCart: boolean;
		pagination: Insite.Core.WebApi.PaginationModel;
		wishListLineCollection: Insite.WishLists.WebApi.V1.ApiModels.WishListLineModel[];
	}
	interface WishListLineModel extends Insite.Core.WebApi.BaseModel {
		id: System.Guid;
		productUri: string;
		productId: System.Guid;
		smallImagePath: string;
		altText: string;
		productName: string;
		manufacturerItem: string;
		customerName: string;
		shortDescription: string;
		qtyOrdered: number;
		erpNumber: string;
		pricing: Insite.Catalog.Services.Dtos.ProductPriceDto;
		quoteRequired: boolean;
		isActive: boolean;
		canEnterQuantity: boolean;
		canShowPrice: boolean;
		canAddToCart: boolean;
		canShowUnitOfMeasure: boolean;
		availability: Insite.Catalog.Services.Dtos.AvailabilityDto;
		breakPrices: Insite.Catalog.Services.Dtos.BreakPriceDto[];
		unitOfMeasure: string;
		unitOfMeasureDisplay: string;
		baseUnitOfMeasure: string;
		baseUnitOfMeasureDisplay: string;
		qtyPerBaseUnitOfMeasure: number;
		selectedUnitOfMeasure: string;
		productUnitOfMeasures: Insite.Catalog.Services.Dtos.ProductUnitOfMeasureDto[];
		packDescription: string;
	}
	interface WishListSettingsModel extends Insite.Core.WebApi.BaseModel {
		allowMultipleWishLists: boolean;
		allowEditingOfWishLists: boolean;
		allowWishListsByCustomer: boolean;
	}
}
declare module Insite.Workflows.WebApi.V1.ApiModels {
	interface ParameterResultsModel {
		parameterName: string;
		resultsName: string;
		hash: string;
	}
	interface AssemblyModel {
	}
	interface ServiceModel {
		serviceName: string;
		assemblyName: string;
		assembly: Insite.Workflows.WebApi.V1.ApiModels.AssemblyModel;
		handlers: Insite.Workflows.WebApi.V1.ApiModels.HandlerModel[];
		hashList: string[];
		signature: System.Tuple<string, string>[];
	}
	interface HandlerModel {
		name: string;
		dependencyOrder: number;
		parameterName: string;
		resultsName: string;
		hash: string;
		parameterResults: Insite.Workflows.WebApi.V1.ApiModels.ParameterResultsModel;
		fullName: string;
	}
	interface ModuleModel extends Insite.Core.WebApi.BaseModel {
		moduleName: string;
		services: Insite.Workflows.WebApi.V1.ApiModels.ServiceModel[];
	}
	interface ModuleCollection extends Insite.Core.WebApi.BaseModel {
		modules: Insite.Workflows.WebApi.V1.ApiModels.ModuleModel[];
	}
	interface HandlerModelCollection {
		handlerModels: Insite.Workflows.WebApi.V1.ApiModels.HandlerModel[];
		totalHandlerTypes: number;
	}
}
declare module Insite.JobQuote.WebApi.V1.ApiModels {
	interface JobQuoteModel extends Insite.Cart.WebApi.V1.ApiModels.CartModel {
		jobQuoteId: string;
		isEditable: boolean;
		expirationDate: Date;
		jobName: string;
		jobQuoteLineCollection: Insite.JobQuote.WebApi.V1.ApiModels.JobQuoteLineModel[];
		customerName: string;
		shipToFullAddress: string;
		currencySymbol: string;
		orderTotal: number;
		orderTotalDisplay: string;
	}
	interface JobQuoteLineModel extends Insite.Cart.WebApi.V1.ApiModels.CartLineModel {
		pricingRfq: Insite.Rfq.WebApi.V1.ApiModels.PricingRfqModel;
		maxQty: number;
		qtySold: number;
		qtyRequested: number;
	}
	interface JobQuoteCollectionModel extends Insite.Core.WebApi.BaseModel {
		jobQuotes: Insite.JobQuote.WebApi.V1.ApiModels.JobQuoteModel[];
	}
}
declare module Insite.Admin.Models {
	interface ExportViewModel {
		pluralizedLabel: string;
		pluralizedName: string;
		assignments: string[];
		properties: Insite.Admin.Models.ExportViewModel.PropertyItem[];
		exportColumns: string[];
	}
	interface ExportDetailsViewModel {
		jobId: System.Guid;
		jobNumber: number;
		jobStartTime: Date;
		jobRecordsCount: number;
		jobRecordsExported: number;
		fileLocation: string;
		isStarted: boolean;
		isFinished: boolean;
		isCanceled: boolean;
		isActive: boolean;
		isFailed: boolean;
		hasErrors: boolean;
	}
	interface JobListModel {
		currentPage: number;
		totalItems: number;
		pageSize: number;
		activeJobs: number;
		jobs: Insite.Admin.Models.JobListItemModel[];
	}
	interface JobListItemModel {
		id: System.Guid;
		startDateTime: Date;
		jobNumber: number;
		status: string;
		isExport: boolean;
		isImport: boolean;
		isSuccess: boolean;
		isFailure: boolean;
		inProgress: boolean;
		isActive: boolean;
		notes: string;
		file: string;
		exportObject: string;
		statusToDisplay: string;
	}
	interface QuickFilterModel {
		operator: string;
		propertyType: string;
		label: string;
		name: string;
		lookupPluralizedName: string;
		dynamicDropdownDisplay: string;
	}
}
declare module Insite.Admin.Models.ExportViewModel {
	interface PropertyItem {
		value: string;
		label: string;
	}
}

