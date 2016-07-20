module insite_admin {
    "use strict";

    (<any>angular)
        .module("insite-admin")
        .factory("httpErrorsInterceptor", [
            "$q", "spinnerService", "$location", "$injector", CustomErrorState.serviceName, ($q, spinnerService, $location: ng.ILocationService, $injector, customErrorState: CustomErrorState) => {
                return {
                    responseError(response) {
                        var modalFactory = $injector.get("ModalFactory");
                        var displayError = (message: string = "Please try again and contact support if you continue to have issues.") => {
                            var errorDialog = new modalFactory({
                                id: new Date().getTime(),
                                class: "modal--medium",
                                templateUrl: "simpleModalDialog",
                                contentScope: {
                                    modalDialogText: message,
                                    modalDialogTitle: "Unhandled Error",
                                    cancelButtonName: "Close",
                                }
                            });

                            errorDialog.activate();
                        }

                        var displayDebuggingError = (response) => {
                            var errorText;
                            if (typeof response.data === "string") {
                                errorText = response.data;
                            } else {
                                errorText = `<div style='white-space: pre-wrap;'>${JSON.stringify(response.data, null, 4)}</div>`;
                            }
                            var html = `<div class='error-modal' style='overflow: scroll;'>
                                                <a href='#' class='simplemodal-close error-modal__close'><i class='icon icon-close'></i></a>
                                                <div class='modal-wrap'>Error with api call, error was: <br/>${errorText}</div>
                                            </div>`;
                            var $html = $(html);
                            (<any>$html).modal();
                        };
                        
                        var config = response.config;
                        if (config["bypassErrorInterceptor"]) {
                            return $q.reject(response);
                        }

                        spinnerService.hide();
                        if (response.status === 404) {
                            if ($location.url().toLowerCase().indexOf("/notfound") === 0) {
                                return false;
                            }
                            // if this was a page change
                            if (response.config.url.toLowerCase() === "/admin" + $location.url().toLowerCase()) {
                                $location.url(`/notFound?path=${response.config.url}`);
                            }
                            // else this was a 404 when a page made an ajax request
                            else if (!customErrorState.shouldDisplayDetails()) {
                                displayError();
                            } else {
                                displayError("The request for " + response.config.url + " resulted in a 404.");
                            }
                        }
                        else if (response.status === 400 || response.status === 403) {
                            if (!customErrorState.shouldDisplayDetails()) {
                                displayError();
                            } else {
                                displayDebuggingError(response);
                            }
                        }
                        else if (response.status === 500) {
                            // if this was a page change
                            if (!customErrorState.shouldDisplayDetails() && response.config.url.toLowerCase() === "/admin" + $location.url().toLowerCase()) {
                                $location.url(`/error?errorCode=500`);
                            } 
                            // else this was a 404 when a page made an ajax request
                            else if (!customErrorState.shouldDisplayDetails()) {
                                displayError();
                            } else {
                                displayDebuggingError(response);
                            }

                        }
                        return $q.reject(response);
                    }
                }
            }
        ]);
}