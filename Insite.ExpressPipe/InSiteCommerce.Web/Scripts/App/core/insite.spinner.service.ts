module insite.core {
    "use strict";

    export interface ISpinnerService {
        register(data: any) : void;
        show(name?: string, infinite?: boolean) : void;
        hide(name?: string) : void;
        showGroup(group: string) : void;
        hideGroup(group: string) : void;
        showAll() : void;
        hideAll() : void;
    }

    export class SpinnerService implements ISpinnerService {

        spinners = {};

        register(data: any): void {
            if (!data.hasOwnProperty("name")) {
                throw new Error("Spinner must specify a name when registering with the spinner service.");
            }
            if (this.spinners.hasOwnProperty(data.name)) {
                throw new Error("A spinner with the name '" + data.name + "' has already been registered.");
            }
            this.spinners[data.name] = data;
        }

        show(name: string = "mainLayout", infinite: boolean = false): void {
            var spinner = this.spinners[name];
            if (!spinner) {
                throw new Error("No spinner named '" + name + "' is registered.");
            }
            spinner.infinite = infinite;
            spinner.show();
        }

        hide(name: string = "mainLayout"): void {
            var spinner = this.spinners[name];
            if (!spinner) {
                throw new Error("No spinner named '" + name + "' is registered.");
            }
            spinner.hide();
        }

        showGroup(group: string): void {
            var groupExists = false;
            for (var name in this.spinners) {
                var spinner = this.spinners[name];
                if (spinner.group === group) {
                    spinner.show();
                    groupExists = true;
                }
            }
            if (!groupExists) {
                throw new Error("No spinners found with group '" + group + "'.");
            }
        }

        hideGroup(group: string): void {
            var groupExists = false;
            for (var name in this.spinners) {
                var spinner = this.spinners[name];
                if (spinner.group === group) {
                    spinner.hide();
                    groupExists = true;
                }
            }
            if (!groupExists) {
                throw new Error("No spinners found with group '" + group + "'.");
            }
        }

        showAll(): void {
            for (var name in this.spinners) {
                this.spinners[name].show();
            }
        }

        hideAll(): void {
            for (var name in this.spinners) {
                if (!this.spinners[name].infinite) {
                    this.spinners[name].hide();
                }
            }
        }
    }

    angular
        .module("insite")
        .service("spinnerService", SpinnerService);
}

