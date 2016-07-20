module insite_admin {
    "use strict";

    export class ApiTesterController {
        url = "/api/v1/admin/";

        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {

        }

        submit(): void {
            var protocolAndHost = window.location.protocol.toLowerCase() + "//" + window.location.host.toLowerCase();
            if (this.url.toLowerCase().indexOf(protocolAndHost) === 0) {
                this.url = this.url.substring(protocolAndHost.length);
            }

            if (this.url.toLowerCase().indexOf("/api/v1/admin") !== 0) {
                alert("This can only be used to test urls that start with /api/v1/admin");
                return;
            }

            this.insertIntoIframe("loading");

            this.$http.get(this.url).then((result) => {
                this.insertIntoIframe(result);
            }, (result) => {
                this.insertIntoIframe(result);
            });
        }

        decode() {
            this.url = decodeURIComponent(this.url);
        }

        insertIntoIframe(result: any) {
            var iframe = <any>document.getElementById("apiTesterIFrame");
            var iframedoc = iframe.document;
            if (iframe.contentDocument)
                iframedoc = iframe.contentDocument;
            else if (iframe.contentWindow)
                iframedoc = iframe.contentWindow.document;
            if (iframedoc) {
                // Put the content in the iframe
                iframedoc.open();
                var html = "<html><head></head><body><div style='white-space: pre;'>" + JSON.stringify(result, null, 4) + "</div></body></html>";
                iframedoc.writeln(html);
                iframedoc.close();
            } else {
                alert("Rendering to iframe failed");
            }
        }
    }

    angular
        .module("insite-admin")
        .controller("ApiTesterController", ApiTesterController);
}