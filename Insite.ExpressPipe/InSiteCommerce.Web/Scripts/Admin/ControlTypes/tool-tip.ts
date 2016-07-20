module insite_admin {
    "use strict";

    declare var Drop;

    export interface ITooltipScope extends ng.IScope {
        content: string;
        offset: string;
        openOn: string;
        position: string;
    }

    export class Tooltip implements ng.IDirective {
        restrict = "A";
        scope = {
            content: "@",
            offset: "@",
            openOn: "@",
            position: "@"
        }

        link(scope: ITooltipScope, elm: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
            var options = {
                target: elm[0],
                position: scope.position || "bottom left",
                openOn: scope.openOn || "hover",
                content: scope.content || "",
                constrainToWindow: true,
                constrainToScrollParent: false,
                classes: "tooltip drop-theme-twipsy",
                tetherOptions: {
                    constraints: [
                        {
                            to: "window",
                            attachment: "together",
                            pin: true
                        }
                    ],
                    offset: scope.offset || "0 0"
                }
            }

            var drop = new Drop(options);
            scope.$on("$destroy", () => drop.destroy());
        }
    }

    angular.module("insite-admin")
        .directive("isaToolTip", DirectiveFactory.GetFactoryFor<Tooltip>(Tooltip));
}