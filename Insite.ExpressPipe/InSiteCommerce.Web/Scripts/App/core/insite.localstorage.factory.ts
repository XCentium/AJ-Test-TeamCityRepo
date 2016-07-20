module insite.core {
    "use strict";

    export interface IWindowStorage {
        set(key: string, value: string): void;
        get(key: string, defaultValue?: string): string;
        setObject(key: string, value: any): void;
        getObject(key: string, defaultValue?: any): any;
        remove(key: string): void;
        removeAll(): void;
        count(): number;
        getKeys(): string[];
    }

    export class WindowLocalStorage implements IWindowStorage {               
       
        constructor(protected $window: ng.IWindowService){            
        }
        
        set(key: string, value: string): void {
            this.$window.localStorage.setItem(key, value);
        }

        get(key: string, defaultValue?: string): string {
            return this.$window.localStorage.getItem(key) || defaultValue;
        }

        setObject(key: string, value: any) {
            this.$window.localStorage.setItem(key, JSON.stringify(value));
        }

        getObject(key: string, defaultValue?: any): any {
            var val = this.$window.localStorage.getItem(key);
            if (val) {
                return JSON.parse(val);
            }
            return defaultValue;
        }

        remove(key: string): void {
            delete this.$window.localStorage[key];
        }

        removeAll(): void {
            this.$window.localStorage.clear();
        }

        count(): number {
            return this.$window.localStorage.length;
        }

        getKeys(): string[] {
            var keys = [];
            for (var x = 0; x < this.$window.localStorage.length; x++) {
                keys.push(this.$window.localStorage.key(x));
            }
            return keys;
        }
    }
    
    factory.$inject = ["$window"];
    function factory($window: ng.IWindowService): WindowLocalStorage {
        return new WindowLocalStorage($window);
    }

    angular
        .module("insite")
        .factory("$localStorage", factory);
}