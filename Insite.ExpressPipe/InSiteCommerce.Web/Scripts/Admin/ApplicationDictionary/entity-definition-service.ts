module insite_admin {
    "use strict";

    export class EntityDefinitionService {
        static $inject = ["$http"];

        constructor(protected $http: ng.IHttpService) {

        }

        // TODO 4.2 optimize this so it doesn't hit the server so much
        getDefinition(pluralizedEntityName: string, filterProperty: string = "pluralizedName", propertiesToSelect?: string): any {
            if (typeof (pluralizedEntityName) === "undefined") {
                throw "pluralizedEntityName is required";
            }
            var select = "name,pluralizedName,label,pluralizedLabel,displayNameFormat,isArchivable,enforceSingleDefault,enforceSingleDefaultForProperty,isHidden";
            var propertySelect = propertiesToSelect ? propertiesToSelect : "name,label,canBeDisplayedInGrid,canEdit,isHidden,propertyTypeDisplay";
            return this.$http.get(`/api/v1/admin/entityDefinitions?$filter=${filterProperty} eq '${pluralizedEntityName}'&$select=${select}&$expand=properties($select=${propertySelect})`).then((result) => {
                return (<any>result).data.value[0];
            });
        }

        getAllDefinitions(selectDefinition: string = "pluralizedLabel,pluralizedName"): ng.IHttpPromise<any> {
            return this.$http.get(`/api/v1/admin/entityDefinitions?$select=${selectDefinition}`);
        }
    }

    angular
        .module("insite-admin")
        .service("entityDefinitionService", EntityDefinitionService);
}