module insite_admin {
    "use strict";

    export class ListFilterCollection {
        private filters = new Array<ListFilter>();
        
        constructor(filters?: ListFilter[]) {
            this.filters = filters;
            if (this.filters === null || typeof(this.filters) === "undefined") {
                this.filters = [];
            }
        }

        any(): boolean {
            return this.filters.length > 0;
        }

        getFilters(): ListFilter[] {
            return this.filters;
        }

        getByName(name: string): ListFilter[] {
            var matchingFilters = new Array<ListFilter>();

            for (var x = 0; x < this.filters.length; x++) {
                if (this.filters[x].name === name) {
                    matchingFilters.push(this.filters[x]);
                }
            }

            return matchingFilters;
        }

        clear(): void {
            this.filters = [];
        }

        add(filter: ListFilter): void {
            this.filters.push(filter);
        }

        remove(name: string): void {
            for (var x = this.filters.length - 1; x >= 0; x--) {
                if (this.filters[x].name === name) {
                    this.filters.splice(x, 1);
                }
            }
        }

        private removeQuickFilter(): void {
            for (var x = 0; x < this.filters.length; x++) {
                if (this.filters[x].isQuickFilter) {
                    this.filters.splice(x, 1);
                }
            }
        }

        replace(filters: ListFilter[]): void {
            this.filters = filters;
        }

        getQuickFilter(): ListFilter {
            for(var x = 0; x < this.filters.length; x++)
            {
                if (this.filters[x].isQuickFilter) {
                    return this.filters[x];
                }
            }
            return null;
        }

        applyQuickFilter(quickFilter: any): void {
            this.removeQuickFilter();
            if (quickFilter.value !== "") {
                var filter = new ListFilter();
                filter.isQuickFilter = true;
                filter.operator = quickFilter.operator;
                filter.property = quickFilter.property;
                filter.propertyType = quickFilter.propertyType;
                filter.value = quickFilter.value;
                filter.lookupPluralizedName = quickFilter.lookupPluralizedName;
                filter.dynamicDropdownDisplay = quickFilter.dynamicDropdownDisplay;
                
                this.add(filter);
            }
        }

        build(): string {
            var filter = "";
            if (this.filters.length > 0) {
                filter += "&$filter=(";
            }
            
            for (var x = 0, length = this.filters.length; x < length; x++) {
                if (x > 0 && x <= length) {
                    filter += " and ";
                }
                filter += this.filters[x].build();
            }

            if (this.filters.length > 0) {
                filter += ")";
            }

            return filter;
        }
    }

    export class ListFilter {
        name: string;
        property: string;
        operator: string;
        propertyType: string;
        value: string;
        isQuickFilter = false;
        raw: string;
        lookupPluralizedName: string;
        dynamicDropdownDisplay: string;

        buildValue(): string {
            if (this.propertyType === "string") {
                return `'${encodeURIComponent(this.value || "")}'`;
            } else if (this.propertyType === "lookup") {
                return `'${encodeURIComponent(this.value || "")}'`;
            } else if (this.propertyType === "number") {
                var value = parseFloat(this.value);
                return !isNaN(value) ? `${value}` : "";
            }

            return this.value || "";
        }

        build(): string {
            if (this.raw) {
                return this.raw;
            }
            else if (this.operator === "startsWith") {
                return `startsWith(${this.property}, ${this.buildValue()}) eq true`;
            }
            else if (this.operator === "wildcard") {
                var value = this.buildValue();
                var filter = "";
                if (this.buildValue().indexOf("*") > -1) {
                    var parts = this.buildValue().split(/[\*]+/i).filter((v) => { return v.length > 0; });
                    var filters = [];
                    var operator = "contains";
                    for (var key in parts) {
                        var part = parts[key];
                        if (part === "'") {
                            continue;
                        }

                        if (part.indexOf("'") === 0) {
                            operator = "startsWith";
                        } else if (part.lastIndexOf("'") === part.length - 1) {
                            operator = "endsWith";
                        }

                        filters.push({ operator, value: part.replace("'", "") });
                        operator = "contains";
                    }
                    
                    if (filters.length > 0) {
                        for (var index = 0, length = filters.length; index < length; index++) {
                            var current: any = filters[index];
                            filter += `${current.operator}(${this.property}, '${current.value}')` + (length > 1 && index !== length - 1 ? " and " : "");
                        }
                    }
                    else {
                        filter = `contains(${this.property}, '') eq true`;
                    }
                } else {
                    filter = `contains(${this.property}, ${value}) eq true`;
                }

                return filter;
            }
            else if (this.operator === "contains") {
                return `contains(${this.property}, ${this.buildValue()}) eq true`;
            }
            else if (this.operator === "equals") {
                var value = this.buildValue();
                return value ? `${this.property} eq ${value}` : "true";
            }
            else if (this.operator === "lookup") {
                var lookupObjectName = this.property.replace("Id", "");
                return `contains(${this.getLookupFilterQuery(lookupObjectName, this.property)}, ${this.buildValue()}) eq true`;
            }
            else if (this.operator === "dynamic") {
                var value = this.buildValue();
                var filterQuery = "";
                if (this.property.slice(-2) === "Id") {
                    var dynamicObjectName = this.property.replace("Id", "");
                    filterQuery = this.getDynamicFilterQuery(dynamicObjectName, this.property);
                } else {
                    filterQuery = this.property;
                }
                
                return value !== "''" ? `contains(${filterQuery}, ${value}) eq true` : "true";
            }

            console.log(`Unhandled operator of ${this.operator}`);

            return "";
        }

        private getLookupFilterQuery(lookupObjectName: string, property: string): string {
            if (!this.lookupPluralizedName) {
                return property;
            }

            var injector = angular.element(document.body).injector();
            var displayNameService = <IDisplayNameService>injector.get("displayNameService");

            var keys = displayNameService.getDisplayNameFormatKeys(this.lookupPluralizedName);
            var parts = displayNameService.getDisplayNameFormat(this.lookupPluralizedName).split(/[{}]+/);
            return this.getFilterQuery(lookupObjectName, keys, parts);
        }

        private getDynamicFilterQuery(lookupObjectName: string, property: string): string {
            if (!this.dynamicDropdownDisplay) {
                return property;
            }

            var matches = this.dynamicDropdownDisplay.match(/{(\w+)}/gi);
            var parts = matches ? matches.map(x => { return x.replace(/[{}]/gi, ""); }) : [this.dynamicDropdownDisplay];

            return this.getFilterQuery(lookupObjectName, parts, parts);
        }

        private getFilterQuery(lookupObjectName: string, parts: string[], keys: string[]): string {
            var result = "", index = 0;
            for (var key in parts) {
                if (parts.hasOwnProperty(key)) {
                    var current = parts[key];
                    if (current) {
                        current = keys.indexOf(current) === -1 ? `'${current}'` : `${lookupObjectName}/${current}`;
                        result = index > 0 ? `concat(${result}, ${current})` : result + current;
                        index++;
                    }
                }
            }

            return result;
        }
    }
}