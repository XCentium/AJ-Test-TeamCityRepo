module insite_admin {
    "use strict";

    export interface ILookupsService {
        getLookups(uri: string): ng.IHttpPromise<any>;

        getLookupsForLookupDropDown(pluralizedEntityName: string, uri: string): ng.IPromise<any>;

        getLookupsForDynamicDropDown(uri: string, key: string, display: string): ng.IPromise<any>;

        getLookupsForEnumDropDown(uri: string, key: string, display: string): ng.IPromise<any>;
    }

    export class LookupsService implements ILookupsService {
        static $inject = ["$http", "$q", "displayNameService"];

        constructor(protected $http: ng.IHttpService,
            protected $q: any,
            protected displayNameService: IDisplayNameService) {
        }

        getLookups(uri: string): ng.IHttpPromise<any> {
            return this.$http.get(uri);
        }

        getLookupsForLookupDropDown(pluralizedEntityName: string, uri: string) {
            var deferred = this.$q.defer();
            this.$http.get(uri).success(o => {
                var currentLookups = [];
                var value = (<any>o).value || [];
                for (var x = 0; x < value.length; x++) {
                    var model = (<any>o).value[x];
                    var entityDisplayName = this.displayNameService.getDisplayNameFor(pluralizedEntityName, model);
                    var item = { id: model.id, name: entityDisplayName };
                    currentLookups.push(item);
                }

                deferred.resolve(currentLookups);
            });

            return deferred.promise;
        }

        getLookupsForDynamicDropDown(uri: string, key: string, display: string) {
            var deferred = this.$q.defer();
            this.$http.get(uri, { bypassErrorInterceptor: true }).success(o => {
                var currentLookups = [];
                this.createResultsOfDynamicLookups(currentLookups, o, key, display);
                deferred.resolve(currentLookups);
            }).error(() => {
                deferred.resolve([]);
            });

            return deferred.promise;
        }

        createResultsOfDynamicLookups(currentLookups: any, object: any, key: string, display: string) {
            var objects = object instanceof Array ? object : object.value || [];
            for (var x = 0; x < objects.length; x++) {
                if ((display.indexOf("{") !== -1 && display.indexOf("}") !== -1) || key.indexOf(".") === -1) {
                    var item = {
                        id: this.getValueFromObjectByTemplate(objects[x], key),
                        name: this.getValueFromObjectByTemplate(objects[x], display)
                    };
                    if (currentLookups.filter(l => { return l.id === item.id; }).length === 0) {
                        currentLookups.push(item);
                    }
                } else {
                    this.createResultsOfDynamicLookups(currentLookups, objects[x][key.substr(0, key.indexOf("."))], key.substr(key.indexOf(".") + 1), display.substr(display.indexOf(".") + 1));
                }
            }
        }

        getValueFromObjectByTemplate(object: any, template: string): string {
            if (template.indexOf("{") !== -1 && template.indexOf("}") !== -1) {
                return template.replace(/{([\w\.]+)}/g, (match, subTemplate) => this.getValueFromObjectByTemplate(object, subTemplate));
            } else if (template.indexOf(".") !== -1) {
                return this.getValueFromObjectByTemplate(object[template.substr(0, template.indexOf("."))], template.substr(template.indexOf(".") + 1));
            }
            return object[template];
        }

        getLookupsForEnumDropDown(uri: string, key: string, display: string) {
            var deferred = this.$q.defer();

            this.$http.get(uri).success(o => {
                var currentLookups = [];
                var value = (<any>o) || [];
                for (var x = 0; x < value.length; x++) {
                    var model = (<any>o)[x];
                    currentLookups.push({ id: model["Value"], name: model["Name"] });
                }

                deferred.resolve(currentLookups);
            });

            return deferred.promise;
        }
    }

    angular
        .module("insite-admin")
        .service("lookupsService", LookupsService);
}