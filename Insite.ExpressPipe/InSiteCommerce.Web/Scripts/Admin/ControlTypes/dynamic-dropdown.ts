module insite_admin {
    "use strict";

    export class DynamicDropdownController extends DropdownController {
        filter: string;
        display: string;
        route: string;

        static $inject = ["lookupsService", "$scope", "$q", "$attrs", "$timeout"];

        constructor(
            protected lookupsService: ILookupsService,
            protected $scope: ng.IScope,
            protected $q: any,
            protected $attrs: ng.IAttributes,
            protected $timeout: ng.ITimeoutService
        ) {
            super(lookupsService, $scope, $q, $attrs, $timeout);
            this.initDynamic();
        }

        initDynamic() {
            var regEx = /({[^}]*})/g;
            var matches = [];
            var match = regEx.exec(this.route + this.filter + this.$attrs["key"] + this.display);
            while (match != null) {
                matches.push(match[1].replace("{", "").replace("}", ""));
                match = regEx.exec(this.route + this.filter + this.$attrs["key"] + this.display);
            }
            this.$scope.$watchGroup(matches, (oldValue, newValue) => {
                var equal = (oldValue.length === newValue.length) && oldValue.every((element, index) => (element === newValue[index]));
                if (!equal) {
                    this.dataSource.query({});
                }
            });
        }

        getLookupsFor(term: string = "", count: number = 250): ng.IPromise<any> {
            var searchFilter = this.buildSearchFilter(term, this.display);
            var filter = this.getFilterQuery(this.isNestedEntity() ? "" : searchFilter);
            var expand = this.isNestedEntity() ? this.getExpandQuery(searchFilter) : "";
            var limit = `&$skip=0&$top=${count}&$count=true`;
            var uri = this.evaluateUri(`${this.route}${this.route.indexOf("?") === -1 ? "?" : ""}${filter}${expand}${limit}`);

            var deferred = this.$q.defer();
            this.lookupsService.getLookupsForDynamicDropDown(uri, this.$attrs["key"], this.display).then(o => {
                this.addStaticValueListOptions(o, term);
                this.addCurrentValueListOption(o, term).then(o => {
                    this.lookups = this.sortList ? o.sort((a, b) => (a.name.localeCompare(b.name))) : o;
                    deferred.resolve(this.lookups);
                });
            });
            return deferred.promise;
        }

        afterGetLookupsFor() {
            if (!this.allowManualEntry && this.selectedEntityIdForDropDown && this.lookups.every(x => x.id.toLowerCase() !== this.selectedEntityIdForDropDown.toLowerCase())) {
                this.selectedEntityIdForDropDown = "";
            }
        }

        onSelectedEntityIdForDropDownChange(newValue: string, oldValue: string) {
            if (newValue === undefined && oldValue !== undefined) {
                return;
            }

            this.selectedEntityIdForDropDown = (this.selectedEntityIdForDropDown === "00000000-0000-0000-0000-000000000000") ? "" : this.selectedEntityIdForDropDown;
            this.selectedEntityId = (this.selectedEntityIdForDropDown === "") ? this.getEmptyValue() : this.selectedEntityIdForDropDown;
        }

        private getEmptyValue(): any {
            return this.$attrs["valueType"] === "guid" ? null : "";
        }

        private buildSearchFilter(term: string, template: string): string {
            if (term.length === 0) {
                return "";
            }

            if (template.indexOf("{") !== -1 && template.indexOf("}") !== -1) {
                return template
                    .match(/{([\w\.]+)}/g)
                    .map(match => this.buildSearchFilter(term, match.substring(1, match.length - 1)))
                    .join(" or ");
            }

            if (template.indexOf(".") !== -1) {
                return this.buildSearchFilter(term, template.replace(".", "/"));
            }

            return `contains(tolower(${template}), tolower('${term}'))`;
        }

        private addStaticValueListOptions(currentLookups: any, term: string) {
            if (this.$attrs["staticValueList"] != null && this.$attrs["staticValueList"] !== "") {
                this.$attrs["staticValueList"].split(",").forEach(staticValue => {
                    var nameValue = staticValue.split(";");
                    var name = nameValue.length > 1 ? nameValue[0] : staticValue;
                    var value = nameValue.length > 1 ? nameValue[1] : staticValue;

                    var item = { name: name, id: value };
                    if (currentLookups.filter(l => { return l.id === item.id; }).length === 0 && item.name.substr(1, term.length).toLowerCase() === term.toLowerCase()) {
                        currentLookups.push(item);
                    }
                });
            }
        }

        private addCurrentValueListOption(currentLookups: any, term: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            if (!this.allowManualEntry || !this.selectedEntityId || term || currentLookups.filter(l => { return l.id === this.selectedEntityId; }).length > 0) {
                deferred.resolve(currentLookups);
                return deferred.promise;
            }

            var expand = this.isNestedEntity() ? this.getExpandQuery("") : "";
            var uri = this.evaluateUri(`${this.route}${this.route.indexOf("?") === -1 ? "?" : ""}$filter=${this.$attrs["key"]} eq ${this.selectedEntityId}${expand}`);
            this.lookupsService.getLookupsForDynamicDropDown(uri, this.$attrs["key"], this.display).then(o => {
                if (o.length > 0) {
                    currentLookups.push(o[0]);
                } else {
                    currentLookups.push({ id: this.selectedEntityId, name: this.selectedEntityId });
                }

                deferred.resolve(currentLookups);
            });
            return deferred.promise;
        }

        private getExpandQuery(filter: string): string {
            var result = "";

            // drill down into nested entities
            for (var x = 0; x < this.$attrs["key"].split(".").length - 1; x++) {
                var entity = this.$attrs["key"].split(".")[x];
                result = result.length > 0 ? `($expand=${entity}` : `&$expand=${entity}`;
            }

            // add filter to final nested entity
            if (filter !== "") {
                result = `${result}($filter=${filter}`;
            }

            // close up any open parenthesis
            while (("result".match(/\(/g) || []).length > ("result".match(/\)/g) || []).length) {
                result = result + ")";
            }

            return result;
        }

        private getFilterQuery(searchFilter: string): string {
            // add the formbuilder entered filter with every query
            var result = this.filter.length > 0 ? `&$filter=${this.filter}` : "";

            // add filter to root level based on what calling method sends in
            if (searchFilter !== "") {
                result = result.length > 0 ? `${result} and (${searchFilter})` : `&$filter=${searchFilter}`;
            }

            return result;
        }

        private isNestedEntity(): boolean {
            // rule is that users can enter property.nestedproperty. e.g. entitydefinition.properties
            return this.$attrs["key"].indexOf(".") !== -1;
        }

        private evaluateUri(uri: string): string {
            // allow users to enter {model.property} to be replaced with the model.property value at execution time
            var regEx = /({[^}]*})/g;
            var match = regEx.exec(uri);
            while (match != null) {
                uri = uri.replace(match[1], <string>this.$scope.$eval(match[1].replace("{", "").replace("}", "")));
                match = regEx.exec(this.filter);
            }
            return uri;
        }
    }

    angular
        .module("insite-admin")
        .controller("DynamicDropdownController", DynamicDropdownController);
}