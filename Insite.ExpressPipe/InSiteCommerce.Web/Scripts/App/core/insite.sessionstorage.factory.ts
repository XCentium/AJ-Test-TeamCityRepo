/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="insite.localstorage.factory.ts" />
module insite.core {
    "use strict";

    export class WindowSessionStorage implements IWindowStorage {

        constructor(protected $window: ng.IWindowService) {
        }

        set(key: string, value: string) {
            this.$window.sessionStorage[key] = value;
        }

        get(key: string, defaultValue: string): string {
            return this.$window.sessionStorage[key] || defaultValue;
        }

        setObject(key: string, value: any) {
            this.$window.sessionStorage[key] = JSON.stringify(value);
        }

        getObject(key: string, defaultValue?: any): any {
            var val = this.$window.sessionStorage.getItem(key);
            if (val) {
                try {
                    return JSON.parse(val);
                } catch (e) {
                    console.log(`Can't parse: ${val}`);
                } 
            }
            return defaultValue;
        }

        remove(key: string) {
            delete this.$window.sessionStorage[key];
        }

        removeAll() {
            this.$window.sessionStorage.clear();
        }

        count(): number {
            return this.$window.sessionStorage.length;
        }

        getKeys(): string[] {
            var keys = [];
            for (var x = 0; x < this.$window.sessionStorage.length; x++) {
                keys.push(this.$window.sessionStorage.key(x));
            }
            return keys;
        }
    }

    factory.$inject = ["$window"];
    function factory($window: ng.IWindowService): WindowSessionStorage {
        return new WindowSessionStorage($window);
    }

    angular
        .module("insite")
        .factory("$sessionStorage", factory);
}