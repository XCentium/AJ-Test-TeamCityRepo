interface JQuery {
    slick(options?: JQuerySlick.ISlickOptions): JQuery;
}

declare module JQuerySlick {
    interface ISlickOptions {
        infinite?: boolean;

        slidesToShow?: number;

        slidesToScroll?: number;

        prevArrow?: string;

        nextArrow?: string;

        accessibility?: boolean;

        responsive?: any;
    }

    interface ISlickApi {
    }
}