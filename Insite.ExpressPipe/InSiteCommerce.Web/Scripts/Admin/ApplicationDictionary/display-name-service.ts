module insite_admin {
    "use strict";

    // service which manages storage of a list of product to compare
    export interface IDisplayNameService {
        isGuid(value: string): boolean;
        getDisplayNameFor(pluralizedEntityName: string, entity: any): string;
        getDisplayNameAsyncFor(pluralizedEntityName: string, entity: any): ng.IPromise<any>;
        getDisplayNameFormat(pluralizedEntityName: string): string;
        getDisplayNameFormatKeys(pluralizedEntityName: string): string[];
        getDisplayNameFormatExpands(pluralizedEntityName: string): string[];
        getDisplayNameForLookup(pluralizedEntityName: string, entityId: System.Guid): ng.IPromise<any>;
        getDisplayNameForDynamic(url: string, key: string, display: string): ng.IPromise<any>;
    }

    export class DisplayNameService implements IDisplayNameService {
        $http: ng.IHttpService;
        entityDisplayNameFormats: any;
        entityLookupDisplayNamesByUrl = {};
        deferredRequestsByUrl = {};

        static $inject = ["$http", "$sessionStorage", "$q", "$timeout", "$filter", "$rootScope"];

        constructor(
            $http: ng.IHttpService,
            protected $sessionStorage: insite.core.IWindowStorage,
            protected $q: ng.IQService,
            protected $timeout: ng.ITimeoutService,
            protected $filter: ng.IFilterService,
            protected $rootScope: ng.IRootScopeService
        ) {
            this.$http = $http;
            var displayNameFormats = this.$sessionStorage.getObject("DisplayNameFormats", null);
            if (displayNameFormats !== null) {
                this.entityDisplayNameFormats = displayNameFormats;
            } else {
                this.$http.get("/admin/DisplayNameFormats").success(result => {
                    this.setupEntityDisplayNameFormats((<any>result).displayNameFormats);
                });
            }

            this.$rootScope.$on("$routeChangeSuccess", () => {
                this.entityLookupDisplayNamesByUrl = {};
            });
        }

        private setupEntityDisplayNameFormats(entityDisplayNames: any): void {
            this.entityDisplayNameFormats = {};

            for (var x = 0; x < entityDisplayNames.length; x++) {
                this.entityDisplayNameFormats[entityDisplayNames[x].pluralizedName] = entityDisplayNames[x].displayNameFormat;
            }

            this.$sessionStorage.setObject("DisplayNameFormats", this.entityDisplayNameFormats);
        }

        isGuid(value: string): boolean {
            return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(value);
        }

        getDisplayNameFor(pluralizedEntityName: string, entity: any): string {
            return this.entityDisplayNameFormats[pluralizedEntityName]
                .replace(/{(\w+)}/g, (match, property) => entity[property])
                .replace(/{lookup\((\w+\,\w+)\)}/g, (match, value) => {
                    var keys = value.split(",");
                    return entity[keys[1].replace("Id", "")] ? entity[keys[1].replace("Id", "")].name : "";
                });
        }

        getDisplayNameAsyncFor(pluralizedEntityName: string, entity: any): ng.IPromise<any> {
            var deferred = this.$q.defer();
            var query = () => {
                var displayNameFormat = this.entityDisplayNameFormats[pluralizedEntityName];
                var lookupMatches = displayNameFormat.match(/{lookup\((\w+\,\w+)\)}/g);
                var lookupDictionary = {};
                if (lookupMatches && lookupMatches.length !== 0) {
                    var parents = {};
                    var promises = [];
                    for (var index = 0; index < lookupMatches.length; index++) {
                        var keys = lookupMatches[index].match(/(\w+)/g);
                        var id = entity[keys[2]];
                        if (id === "00000000-0000-0000-0000-000000000000" || id === "") {
                            continue;
                        } else if (!this.isGuid(id)) {
                            parents[id] = { key: keys[1], label: id };
                            continue;
                        }

                        parents[id] = { key: keys[1], lookupFormat: lookupMatches[index] };
                        var promise = this.getEntity(keys[1], id.toString()).then((parent) => {
                            if (parent) {
                                parents[parent.id].displayNameFormat = this.entityDisplayNameFormats[parents[parent.id].key];
                                lookupDictionary[parents[parent.id].lookupFormat] = this.getDisplayName(this.entityDisplayNameFormats[parents[parent.id].key], parent);
                            }

                            return "";
                        });
                        promises.push(promise);
                    }

                    this.$q.all(promises).then(() => {
                        deferred.resolve(this.getDisplayName(displayNameFormat, entity, lookupDictionary));
                    });

                } else {
                    deferred.resolve(this.getDisplayName(displayNameFormat, entity));
                }
            };

            if (this.entityDisplayNameFormats && this.entityDisplayNameFormats.hasOwnProperty(pluralizedEntityName)) {
                query();
            } else {
                this.$timeout(query, 500);
            }

            return <ng.IPromise<any>>deferred.promise;
        }

        private getDisplayName(displayNameFormat: string, entity: any, lookupDictionary?: any): string {
            var matches = displayNameFormat.match(/{(\w+)}|{lookup\((\w+\,\w+)\)}/g);
            var result = "";
            var currentIndex = 0;

            if (!matches) {
                return displayNameFormat;
            }

            matches.forEach(match => {
                var indexOfProperty = displayNameFormat.indexOf(match);
                var property = match.replace("{", "").replace("}", "");
                var propertyValue = /{(\w+)}/.test(match) ? entity[property] : lookupDictionary[match];
                if (propertyValue) {
                    var value = /\d+-\d+-\d+T\d+:\d+:\d+/.test(propertyValue) ? this.$filter("date")(propertyValue, "short") : propertyValue;
                    result += displayNameFormat.substring(currentIndex, indexOfProperty) + value;
                }

                currentIndex = indexOfProperty + match.length;
            });
            return result;
        }

        getDisplayNameFormat(pluralizedEntityName: string): string {
            return this.entityDisplayNameFormats[pluralizedEntityName];
        }

        getDisplayNameFormatKeys(pluralizedEntityName: string): string[] {
            return this.entityDisplayNameFormats[pluralizedEntityName].match(/{(\w+)}/gi).map(x => { return x.replace(/[{}]/gi, ""); });
        }

        getDisplayNameFormatExpands(pluralizedEntityName: string): string[] {
            var matches = this.entityDisplayNameFormats[pluralizedEntityName].match(/{lookup\((\w+\,\w+)\)}/gi);
            if (!matches) {
                return [];
            }

            return matches.map(x => {
                return x.replace(/{lookup\((\w+\,\w+)\)}/g, (match, value) => {
                    var keys = value.split(",");
                    return keys[1].replace("Id", "");
                });
            });
        }

        getDisplayNameForLookup(pluralizedEntityName: string, entityId: System.Guid): ng.IPromise<any> {
            var keys = this.getDisplayNameFormatKeys(pluralizedEntityName);
            var expands = this.getDisplayNameFormatExpands(pluralizedEntityName);
            var url = `/api/v1/admin/${pluralizedEntityName}(${entityId})?$select=${keys}&$expand=${expands}`;
            return this.getDisplayNameResponse(url);
        }

        getDisplayNameForDynamic(url: string, key: string, display: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.getDisplayNameResponse(url).then(result => {
                if (result.value.length === 0) {
                    deferred.reject();
                } else {
                    var item = {
                        id: this.getValueFromObjectByTemplate(result.value[0], key),
                        name: this.getValueFromObjectByTemplate(result.value[0], display)
                    };
                    deferred.resolve(item);
                }
            });
            return <ng.IPromise<any>>deferred.promise;
        }

        private getDisplayNameResponse(url: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            if (this.entityLookupDisplayNamesByUrl[url]) {
                // check if previous request is still in progress
                if (typeof this.entityLookupDisplayNamesByUrl[url] === "boolean") {
                    this.deferredRequestsByUrl[url].push(deferred);
                } else {
                    deferred.resolve(this.entityLookupDisplayNamesByUrl[url]);
                }
            } else {
                this.entityLookupDisplayNamesByUrl[url] = true;
                this.deferredRequestsByUrl[url] = [];
                this.$http.get(url).success((result: any) => {
                    this.entityLookupDisplayNamesByUrl[url] = result;
                    for (var i = 0; i < this.deferredRequestsByUrl[url].length; i++) {
                        this.deferredRequestsByUrl[url][i].resolve(result);
                    }
                    deferred.resolve(result);
                });
            }

            return <ng.IPromise<any>>deferred.promise;
        }

        private getEntity(pluralizedEntityName: string, entityId: string): ng.IPromise<any> {
            var deferred = this.$q.defer();
            this.$http.get(`/api/v1/admin/${pluralizedEntityName}(${entityId})`).success((result: any) => {
                deferred.resolve(result);
            });

            return <ng.IPromise<any>>deferred.promise;
        }

        private getValueFromObjectByTemplate(object: any, template: string): string {
            if (template.indexOf("{") !== -1 && template.indexOf("}") !== -1) {
                return template.replace(/{([\w\.]+)}/g, (match, subTemplate) => this.getValueFromObjectByTemplate(object, subTemplate));
            }
            return this.getPropertyValue(object, template);
        }

        private getPropertyValue(object: any, template: string): string {
            if (!object || !template) {
                return "";
            }

            var firstDotIndex = template.indexOf(".");
            return firstDotIndex > 0 ? this.getPropertyValue(object[template.slice(0, firstDotIndex)], template.slice(firstDotIndex + 1, template.length)) : object[template];
        }
    }

    angular
        .module("insite-admin")
        .service("displayNameService", DisplayNameService);
}