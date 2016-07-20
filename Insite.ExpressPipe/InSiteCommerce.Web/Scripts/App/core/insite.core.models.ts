module insite.core {
    "use strict";

    export interface CurrentContextModel {
        languageId: System.Guid;
        currencyId: System.Guid;
        billToId: System.Guid;
        shipToId: System.Guid;
        pageUrl: string;
    }
}