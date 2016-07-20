interface JQuery {
    sticky(options?: JQuerySticky.IStickyOptions): JQuery;
}

declare module JQuerySticky {
    interface IStickyOptions {
        topSpacing?: number;
        bottomSpacing?: number;
    }

    interface IStickyApi {
    }
}