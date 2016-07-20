module insite_admin {
    import Core = insite.core;
    "use strict";

    export interface IEntityListStateService {
        clearStateFor(pluralizedEntityName: string): void;
        setStateFor(pluralizedEntityName: string, entityListState: EntityListState): void;
        getStateFor(pluralizedEntityName: string): EntityListState;
        clearAllStates(): void;
    }

    export class EntityListStateService implements IEntityListStateService {
        static $inject = ["$sessionStorage"];
        constructor(
            protected $sessionStorage: Core.IWindowStorage
        ) {

        }

        clearStateFor(pluralizedEntityName: string): void {
            this.$sessionStorage.setObject(this.getKeyFor(pluralizedEntityName), null);
        }

        setStateFor(pluralizedEntityName: string, entityListState: EntityListState): void {
            this.$sessionStorage.setObject(this.getKeyFor(pluralizedEntityName), entityListState);
        }

        getStateFor(pluralizedEntityName: string): EntityListState {
            var entityListState = this.$sessionStorage.getObject(this.getKeyFor(pluralizedEntityName));
            if (entityListState !== null && typeof(entityListState) !== "undefined") {
                entityListState.filters = this.updateListFiltersCollection(entityListState.filters);
            }
            return entityListState;
        }

        //TODO: It's need because after JSON.parse we can't use the methods of class ListFilter, maybe we can move it in service
        private updateListFiltersCollection(filters: ListFilter[]): ListFilter[]{
            var result: Array<ListFilter> = [];

            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    var current = filters[key];
                    var listFilter = new ListFilter();
                    for (var prop in current) {
                        if (current.hasOwnProperty(prop)) {
                            listFilter[prop] = current[prop];
                        }
                    }

                    result.push(listFilter);
                }
            }

            return result;
        }

        clearAllStates(): void {
            var keys = this.$sessionStorage.getKeys();
            for (var x = 0; x < keys.length; x++) {
                if (keys[x].indexOf("entityListState-") === 0) {
                    this.$sessionStorage.remove(keys[x]);
                }
            }
        }

        private getKeyFor(pluralizedEntityName: string) {
            return `entityListState-${pluralizedEntityName}`;
        }
    }

    angular
        .module("insite")
        .service("entityListStateService", EntityListStateService);
}