
CREATE PROCEDURE [dbo].[sp_InsertOrderDetailsScrub]
(
	@OrderHeaderId uniqueidentifier,
	@ItemCode varchar(1),
	@Description varchar(100),
	@LineItemID varchar(10),
	@ProductID varchar(10),
	@PDWID varchar(10),
	@DescAsStored varchar(10),
	@UPC varchar(20),
	@OrderQty int,
	@UnitPrice numeric(18, 9),
	@SellUnit varchar(10),
	@SellUnitQty varchar(10),
	@ItemReleaseNo varchar(10),
	@ShipQty int,
	@ShipQtyAlpha varchar(10),
	@SerialNumbers varchar(50),
	@AvailableDate datetime,
	@AvailableQty int,
	@SubtotalAmt numeric(18, 9),
	@SubtotalLineItemID varchar(10),
	@OrderNo varchar(10),
	@Generation varchar(4)
)
AS
BEGIN
	SET NOCOUNT ON
	SET XACT_ABORT ON

	INSERT OrderDetails_Scrub
	(
		OrderHeaderId,
		ItemCode,
		Description,
		LineItemID,
		ProductID,
		PDWID,
		DescAsStored,
		UPC,
		OrderQty,
		UnitPrice,
		SellUnit,
		SellUnitQty,
		ItemReleaseNo,
		ShipQty,
		ShipQtyAlpha,
		SerialNumbers,
		AvailableDate,
		AvailableQty,
		SubtotalAmt,
		SubtotalLineItemID,
		OrderNo,
		Generation
	)
	VALUES
	(
		@OrderHeaderId,
		@ItemCode,
		@Description,
		@LineItemID,
		@ProductID,
		@PDWID,
		@DescAsStored,
		@UPC,
		@OrderQty,
		@UnitPrice,
		@SellUnit,
		@SellUnitQty,
		@ItemReleaseNo,
		@ShipQty,
		@ShipQtyAlpha,
		@SerialNumbers,
		@AvailableDate,
		@AvailableQty,
		@SubtotalAmt,
		@SubtotalLineItemID,
		@OrderNo,
		@Generation
	)


END