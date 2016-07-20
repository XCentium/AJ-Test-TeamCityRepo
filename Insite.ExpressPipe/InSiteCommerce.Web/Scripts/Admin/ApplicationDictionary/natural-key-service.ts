module insite_admin {
    import Core = insite.core;
    "use strict";

    export interface INaturalKeyService {
        getNaturalKeys(entityName: string): {}[];
        getRootLevelNaturalKeys(entityName: string): {}[];
    }

    export class NaturalKeyService implements INaturalKeyService {
        entityNaturalKeys: any;

        static $inject = ["$http", "$sessionStorage"];

        constructor(
            protected $http: ng.IHttpService,
            protected $sessionStorage: Core.IWindowStorage
        ) {
            var naturalKeys = this.$sessionStorage.getObject("NaturalKeys", null);
            if (naturalKeys !== null) {
                this.entityNaturalKeys = naturalKeys;
            } else {
                this.$http.get("/api/v1/admin/entitydefinitions?$expand=properties($filter=naturalKeySequence ne null)").success(result => {
                    this.setupEntityNaturalKeys((<any>result).value);
                });
            }
        }

        private setupEntityNaturalKeys(entityDefinitions: any): void {
            this.entityNaturalKeys = {};

            for (var x = 0; x < entityDefinitions.length; x++) {
                var entityDefinition = entityDefinitions[x];
                var naturalKeys = [];
                for (var y = 0; y < entityDefinition.properties.length; y++) {
                    var naturalKey = entityDefinition.properties[y];
                    naturalKeys.push({ name: naturalKey.name, label: naturalKey.label, naturalKeySequence: naturalKey.naturalKeySequence });
                }

                this.entityNaturalKeys[entityDefinition.name.toLowerCase()] = naturalKeys;
                this.entityNaturalKeys[entityDefinition.pluralizedName.toLowerCase()] = naturalKeys;
            }

            this.$sessionStorage.setObject("NaturalKeys", this.entityNaturalKeys);
        }

        getNaturalKeys(entityName: string): {}[] {
            return this.entityNaturalKeys[entityName.toLowerCase()] || [];
        }

        getRootLevelNaturalKeys(entityName: string): {}[] {
            var naturalKeys = this.entityNaturalKeys[entityName.toLowerCase()];
            if (!naturalKeys && entityName.indexOf("Id", entityName.length - 2) !== -1) {
                naturalKeys = this.entityNaturalKeys(entityName.substr(0, entityName.length - 2));
            }
            if (!naturalKeys) {
                return [];
            }

            var currentNaturalKeys = [];
            for (var i = 0; i < naturalKeys.length; i++) {
                if (naturalKeys[i].name.indexOf("Id", naturalKeys[i].name.length - 2) !== -1) {
                    var childNaturalKeys = this.getRootLevelNaturalKeys(naturalKeys[i].name.substr(0, naturalKeys[i].name.length - 2));
                    if (childNaturalKeys.length > 0) {
                        currentNaturalKeys = currentNaturalKeys.concat(childNaturalKeys);
                    } else {
                        currentNaturalKeys.push(naturalKeys[i]);
                    }
                } else {
                    currentNaturalKeys.push(naturalKeys[i]);
                }
            }

            for (var x = 0; x < currentNaturalKeys.length; x++) {
                currentNaturalKeys[x].naturalKeySequence = x;
            }

            return currentNaturalKeys;
        }
    }

    angular
        .module("insite-admin")
        .service("naturalKeyService", NaturalKeyService);
}