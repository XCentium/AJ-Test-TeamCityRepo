module insite_admin {
    "use strict";

    export interface IRuleGroupModel {
        rules: IRuleModel[];
        ruleCondition: string;
        groupCondition: string;
    }

    export interface IRuleModel {
        id: any;
        type: any;
        parameters: any;
        properties: any[];
        pluralizedlookupObject: string;
    }

    export interface IRuleClause {
        ruleManagerId: string;
        ruleTypeOptionId: string;
        executionGroup: number;
        executionOrder: number;
        condition: string;
        criteriaType: string;
        criteriaObject: string;
        criteriaProperty: string;
        criteriaValue: string;
        comparisonOperator: string;
        simpleValue: string;
        valueList: string;
        valueMinimum: string;
        valueMaximum: string;
    }

    export class RuleManagerController {
        initialModel: any;
        model: any;
        isDirtyParameter: boolean;
        ruleManagerModel: any;
        entityDefinition: any;
        criteriatypes: any;
        ruleGroups: IRuleGroupModel[] = [];
        initRuleGroups: IRuleGroupModel[];
        propertyServiceUri: any;
        loadComplete: number = 0;
        ruleTypeOptions: any;
        form: any;
        groupsCondition: string = "And";
        criteriaObjectTypes: any = {};
        filtersDictionary: any;

        static $inject = [
            "$rootScope",
            "$scope",
            "$http",
            "$q",
            "spinnerService",
            "FoundationApi",
            "entityDefinitionService",
            "fingerTabsService",
            "$location",
            "notificationService",
            "$filter",
            "displayNameService"
        ];

        constructor(
            protected $rootScope: ng.IRootScopeService,
            protected $scope: ng.IScope,
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected spinnerService: ISpinnerService,
            protected $foundationApi: any,
            protected entityDefinitionService: EntityDefinitionService,
            protected fingerTabsService: FingerTabsService,
            protected $location: ng.ILocationService,
            protected notificationService: INotificationService,
            protected $filter: ng.IFilterService,
            protected displayNameService: IDisplayNameService)
        {
            this.init();
        }

        init() {
            this.filtersDictionary = {
                "OrderBillTo": "IsBillTo eq true and IsActive eq true"
            }

            this.$http.get("/api/v1/admin/criteriatypes").then((result: any) => {
                this.criteriatypes = result.data.value;
                this.propertyServiceUri.ruleManager = {
                    url: "",
                    tab: this.fingerTabsService.getSelectedTab(this.$location.path())
                };
                this.loadModel();
            });

            this.$scope.$on("EditEntityAfterSaved", () => {
                this.save();
            });

            this.$scope.$watch("vm.ruleGroups", (newValue) => {
                if (this.loadComplete === 0) {
                    var changed = !angular.equals(this.initRuleGroups, newValue);
                    if (changed) {
                        this.model.ruleManager = {};
                    }
                    else {
                        delete this.model.ruleManager;
                    }
                }
            }, true);
        }

        hasRules(): boolean {
            if (this.ruleGroups.length > 1) {
                return true;
            }
            for (var i = 0; i < this.ruleGroups.length; i++) {
                if (this.ruleGroups[i].rules.length > 1 || this.ruleGroups[i].rules[0].type) {
                    return true;
                }
            }
            return false;
        }

        getDeleteRuleGroupClass() {
            return !this.canDeleteRuleGroup() ? "disabled" : "";
        }

        canDeleteRuleGroup() {
            return this.ruleGroups.length > 1;
        }

        getDeleteRuleClass(groupIndex: number) {
            return !this.canDeleteRuleForGroup(groupIndex) ? "disabled" : "";
        }

        canDeleteRuleForGroup(groupIndex: number) {
            var ruleGroup = this.ruleGroups[groupIndex];

            return ruleGroup.rules.length > 1
                || ruleGroup.rules[0].type;
        }

        changeType(rule: IRuleModel): void {
            if (!rule.type) {
                return;
            }

            rule.pluralizedlookupObject = "";

            if (rule.type.requiresCriteriaObject) {
                this.loadProperties(rule, "CriteriaProperty");
            }

            this.loadLookupPluralizedName(rule);

            for (var key in rule.parameters) {
                rule.parameters[key] = "";
            }

            for (var i = 0; i < rule.type.parameterDescriptions.length; i++) {
                if (rule.type.parameterDescriptions[i].name === "ComparisonOperator") {
                    // if one item, select first, else user should select manually
                    if (rule.type.parameterDescriptions[i].possibleValues && rule.type.parameterDescriptions[i].possibleValues.length === 1) {
                        rule.parameters["ComparisonOperator"] = rule.type.parameterDescriptions[i].possibleValues[0];
                    } else {
                        this.form.$setPristine();
                    }
                    break;
                }
            }
        }

        showDeletePopup(): void {
            this.$foundationApi.publish("deleteRuleManagerRules", "open");
        }

        removeAllRules(): void {
            this.ruleGroups = [<IRuleGroupModel>{
                rules: [this.createRule()],
                ruleCondition: "And",
                groupCondition: "And"
            }];
            this.$foundationApi.publish("deleteRuleManagerRules", "close");
        }

        changeGroupCondition(groupIndex: number, value: string): void {
            this.groupsCondition = value;
            for (var key in this.ruleGroups) {
                this.ruleGroups[key].groupCondition = value;
            }
        }

        changeRuleCondition(groupIndex: number): void {
        }

        expandRule(index: number): void {
            if (this.ruleGroups[index].rules.length > 0 && this.ruleGroups[index].rules[this.ruleGroups[index].rules.length - 1].type) {
                this.ruleGroups[index].rules.push(this.createRule());
            }
        }

        deleteRule(groupIndex: number, index: number): void {
            if (!this.canDeleteRuleForGroup(groupIndex)) {
                return;
            }

            var rulesForGroup = this.ruleGroups[groupIndex].rules,
                rulesForGroupLength = rulesForGroup.length;

            if (this.ruleGroups.length <= 1 && rulesForGroupLength <= 1) {
                this.groupsCondition = "And";
                this.ruleGroups = [this.createRuleGroup()];
                this.ruleGroups[0].rules.push(this.createRule());

                return;
            }

            if (rulesForGroupLength > 1) {
                rulesForGroup.splice(index, 1);
            } else {
                this.ruleGroups[groupIndex].rules = [this.createRule()];
            }
        }

        expandGroup(): void {
            this.ruleGroups.push(<IRuleGroupModel>{
                rules: [this.createRule()],
                ruleCondition: "And",
                groupCondition: this.groupsCondition
            });
        }

        deleteGroup(index: number): void {
            if (!this.canDeleteRuleGroup()) {
                return;
            }

            if (this.ruleGroups.length > 1) {
                this.ruleGroups.splice(index, 1);
            } else if (this.ruleGroups.length <= 1) {
                this.groupsCondition = "And";
                this.ruleGroups = [this.createRuleGroup()];
                this.ruleGroups[0].rules.push(this.createRule());
            }
        }

        showCondition(index: number): boolean {
            return this.ruleGroups.length !== index + 1;
        }

        showAddRule(groupIndex: number, index: number): boolean {
            return this.ruleGroups[groupIndex].rules[this.ruleGroups[groupIndex].rules.length - 1].type;
        }

        showAddRuleGroup(index: number): boolean {
            return this.ruleGroups.length === index + 1;
        }

        loadProperties(rule: IRuleModel, propertyFieldName: string, isInit?: boolean): ng.IPromise<any> {
            var defer = this.$q.defer();

            if (rule.type.ruleTypeOption.criteriaProperty.toLowerCase() !== "all properties" && rule.type.ruleTypeOption.criteriaType !== "CustomProperty") {
                rule.properties = [];
                defer.resolve(rule);
            } else {
                this.spinnerService.show();
                var criteriaObject = rule.type.ruleTypeOption.criteriaObject.charAt(0).toLowerCase() + rule.type.ruleTypeOption.criteriaObject.slice(1);
                if (rule.type.ruleTypeOption.criteriaType !== "CustomProperty") {
                    if (criteriaObject === "locationDto") {
                        for (var i = 0; i < rule.type.parameterDescriptions.length; i++) {
                            if (rule.type.parameterDescriptions[i].name === propertyFieldName) {
                                this.fillRuleProperties(rule, [{ name: "city", label: "City" }, { name: "countryAbbreviation", label: "Country Abbreviation" }, { name: "latitude", label: "Latitude" }, { name: "longitude", label: "Longitude" }, { name: "postalCode", label: "Postal Code" }, { name: "stateAbbreviation", label: "State Abbreviation" }]);
                                break;
                            }
                        }
                        defer.resolve(rule);
                        this.spinnerService.hide();
                    } else {
                        this.entityDefinitionService.getDefinition(criteriaObject, "name", "name,label,isHidden,propertyTypeDisplay").then((result: any) => {
                            if (result && result.properties) {
                                for (var i = 0; i < rule.type.parameterDescriptions.length; i++) {
                                    if (rule.type.parameterDescriptions[i].name === propertyFieldName) {
                                        this.fillRuleProperties(rule, result.properties);
                                        this.sortProperties(rule);
                                        break;
                                    }
                                }
                            }

                            if (isInit) {
                                this.decrimentLoadComplete();
                            }

                            defer.resolve(rule);
                        }).finally(() => { this.spinnerService.hide(); });
                    }
                } else {
                    this.entityDefinitionService.getDefinition(criteriaObject, "name", "name,label,isHidden,propertyTypeDisplay,isCustomProperty").then((result: any) => {
                        if (result && result.properties) {
                            for (var i = 0; i < rule.type.parameterDescriptions.length; i++) {
                                if (rule.type.parameterDescriptions[i].name === propertyFieldName) {
                                    this.fillRuleProperties(rule, result.properties.filter((prop) => { return prop.isCustomProperty; }));
                                    this.sortProperties(rule);
                                    break;
                                }
                            }
                        }

                        if (isInit) {
                            this.decrimentLoadComplete();
                        }

                        defer.resolve(rule);
                    }).finally(() => { this.spinnerService.hide(); });
                }
            }

            return defer.promise;
        }

        private sortProperties(rule: IRuleModel): void {
            rule.properties.sort((a, b) => ((a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0));
        }

        private fillRuleProperties(rule: IRuleModel, properties: any[]): void {
            rule.properties = [];
            var keys = {}, prop;
            // some properties have same labels (billTo and shipTo -> city, address 1 end etc)
            for (prop in properties) {
                if (properties.hasOwnProperty(prop)) {
                    if (properties[prop].label) {
                        if (keys[properties[prop].label]) {
                            keys[properties[prop].label]++;
                        } else {
                            keys[properties[prop].label] = 1;
                        }
                    }
                }
            }
            for (prop in properties) {
                // filtering properties from child objects and collections
                if (properties.hasOwnProperty(prop) && !properties[prop].isHidden && (!properties[prop].propertyTypeDisplay || properties[prop].propertyTypeDisplay.indexOf("Insite.Data.Entities.") === -1)) {
                    var label = properties[prop].label || properties[prop].name;
                    if (properties[prop].label && keys[properties[prop].label] > 1) {
                        label += ` (${properties[prop].name})`;
                    }

                    var type = "text";
                    var propType = properties[prop].propertyTypeDisplay;
                    if (propType) {
                        if (propType.indexOf("System.DateTime") >= 0) {
                            type = "date";
                        } else if (propType.indexOf("System.Int") >= 0 || propType.indexOf("System.Decimal") >= 0
                            || propType.indexOf("System.Double") >= 0 || propType.indexOf("System.Single") >= 0) {
                            type = "number";
                        } else if (propType.indexOf("System.Boolean") >= 0) {
                            type = "checkbox";
                        }
                    }

                    rule.properties.push({ label: label, value: properties[prop].name, type });
                }
            }
        }

        save(): void {
            if (!this.ruleGroups || this.ruleGroups.length === 0) {
                return;
            }

            var ruleClauses: IRuleClause[] = [];

            var lastExecutionOrderInGroup = 0;

            for (var groupIndex = 0, groupsLength = this.ruleGroups.length; groupIndex < groupsLength; groupIndex++) {
                var group = this.ruleGroups[groupIndex];
                for (var ruleIndex = 0, rulesLength = group.rules.length; ruleIndex < rulesLength; ruleIndex++) {
                    var rule = group.rules[ruleIndex];
                    if (!rule.type) {
                        break;
                    }

                    var ruleClause = <IRuleClause>{};
                    ruleClause.ruleTypeOptionId = rule.type.ruleTypeOption.id;
                    ruleClause.executionGroup = groupIndex;
                    ruleClause.executionOrder = (groupIndex === 0 ? lastExecutionOrderInGroup : lastExecutionOrderInGroup + 1) + ruleIndex;
                    ruleClause.condition = group.ruleCondition;
                    ruleClause.comparisonOperator = rule.parameters["ComparisonOperator"];
                    ruleClause.valueList = "";

                    if (rule.type) {
                        ruleClause.criteriaType = rule.type.name;
                    }

                    ruleClause.criteriaObject = rule.type.ruleTypeOption.criteriaObject;

                    if (rule.parameters) {
                        if (rule.parameters.hasOwnProperty("CriteriaProperty")) {
                            ruleClause.criteriaProperty = rule.parameters["CriteriaProperty"].charAt(0).toUpperCase() +
                                rule.parameters["CriteriaProperty"].slice(1);
                        }

                        if (rule.type.requiresGeocode && rule.parameters.hasOwnProperty("CriteriaProperty")) {
                            ruleClause.criteriaProperty = rule.parameters["CriteriaProperty"];
                        }

                        if (rule.type.requiresCriteriaValue && rule.parameters.hasOwnProperty("CriteriaValue")) {
                            ruleClause.criteriaValue = rule.parameters["CriteriaValue"];
                        }

                        if (rule.parameters.hasOwnProperty("ValueList")) {
                            ruleClause.valueList = rule.parameters["ValueList"];
                        }

                        if (rule.parameters.hasOwnProperty("SimpleValue")) {
                            ruleClause.simpleValue = rule.parameters["SimpleValue"] == null ? "" : rule.parameters["SimpleValue"].toString();
                        }

                        if (rule.parameters.hasOwnProperty("ValueMaximum")) {
                            ruleClause.valueMaximum = rule.parameters["ValueMaximum"].toString();
                        }

                        if (rule.parameters.hasOwnProperty("ValueMinimum")) {
                            ruleClause.valueMinimum = rule.parameters["ValueMinimum"].toString();
                        }
                    }

                    if (groupsLength > 1 && ruleIndex === rulesLength - 1) {
                        ruleClause.condition = group.groupCondition;
                        lastExecutionOrderInGroup = ruleClause.executionOrder;
                    }

                    ruleClauses.push(ruleClause);
                }
            }

            if (this.ruleManagerModel.id === "00000000-0000-0000-0000-000000000000") {
                var data = this.ruleManagerModel;
                delete data.ruleClauses;
                this.$http.post(`/api/v1/admin/ruleManagers`, data).success((result: any) => {
                    this.ruleManagerModel.id = result.id;
                    this.model.ruleManagerId = result.id;
                    this.$http({
                        method: "PATCH",
                        url: `/api/v1/admin/${this.entityDefinition.pluralizedName}(${this.model.id})`,
                        data: { ruleManagerId: result.id }
                    }).success(() => {
                        this.isDirtyParameter = false;
                    });
                    this.saveRules(ruleClauses);
                });
            } else {
                this.saveRules(ruleClauses);
            }
        }

        saveRules(ruleClauses: IRuleClause[]) {
            this.$http({
                method: "POST",
                url: `/api/v1/admin/ruleManagers(${this.ruleManagerModel.id})/rules`,
                data: { ruleClauses: ruleClauses }
            }).then(() => {
                this.spinnerService.hide();
                this.notificationService.show(NotificationType.Success, `Successfully saved rules!`);

                delete this.initialModel.ruleManager;
                delete this.model.ruleManager;
                this.initialModel.ruleManagerId = this.model.ruleManagerId;
            },() => {
                this.spinnerService.hide();
            });
        }

        showFieldError(key: string): boolean {
            return this.form[key] && this.form[key].$dirty && this.form[key].$invalid && this.form[key].$error.required;
        }

        enableGeocode(rule: IRuleModel): boolean {
            return (typeof rule.parameters["CriteriaProperty"] != "undefined") && rule.parameters["CriteriaProperty"].trim();
        }

        searchGeocode(rule: IRuleModel): void {
            if (!this.enableGeocode(rule)) {
                return;
            }

            this.spinnerService.show();
            this.$http.post("/admin/Geocoder/geocodeAddress", { address: rule.parameters["CriteriaProperty"] }).then((result: any) => {
                this.spinnerService.hide();
                rule.parameters["ValueMinimum"] = result.data.Latitude,
                rule.parameters["ValueMaximum"] = result.data.Longitude;
            }, () => {
                this.spinnerService.hide();
            });
        }

        filterParameters(rule: IRuleModel) {
            return (parameter: any) => {
                return parameter.availableComparisonOperators.length === 0 || parameter.availableComparisonOperators.indexOf(rule.parameters["ComparisonOperator"]) >= 0;
            };
        }

        getCriteriaPropertyType(rule: IRuleModel): string {
            if (rule.properties) {
                var properties = rule.properties.filter((prop) => prop.value === rule.parameters["CriteriaProperty"]);
                if (properties.length > 0) {
                    return properties[0].type || "text";
                }
            }
            
            return "text";
        }

        filterComparisonOperator(rule: IRuleModel): any {
            return (operator: string): boolean => {
                if (!rule.type.requiresCriteriaObject || !rule.type.requiresCriteriaProperty || !rule.properties || !rule.type.ruleTypeOption || !rule.type.ruleTypeOption.criteriaObject) {
                    return true;
                }

                var propertyName = rule.parameters["CriteriaProperty"];
                if (!propertyName) {
                    return true;
                }

                var key = rule.type.ruleTypeOption.criteriaObject + "_" + propertyName;
                if (!this.criteriaObjectTypes[key]) {
                    var property = rule.properties.filter(x => x.value === propertyName);
                    this.criteriaObjectTypes[key] = property.length === 1 ? property[0].type : null;
                }

                var type = this.criteriaObjectTypes[key];
                if (!type) {
                    return false;
                }

                if ((type === "date" || type === "number" || type === "checkbox") && (operator === "List" || operator === "Matches")) {
                    var comparisonOperator = rule.parameters["ComparisonOperator"];
                    if (comparisonOperator === "List" || comparisonOperator === "Matches") {
                        rule.parameters["ComparisonOperator"] = "";
                    }
                    return false;
                }

                if ((type === "text" || type === "checkbox") && operator === "Range") {
                    if (rule.parameters["ComparisonOperator"] === "Range") {
                        rule.parameters["ComparisonOperator"] = "";
                    }
                    return false;
                }

                if (type === "checkbox" && operator !== "Equals") {
                    return false;
                }

                return true;
            };
        }

        hasFilter(ruleType: string): boolean {
            return this.filtersDictionary[ruleType];
        }

        getDisplayNameFormat(pluralizedName: string): string {
            return this.displayNameService.getDisplayNameFormat(pluralizedName);
        }

        private loadModel(): void {
            if (this.model.ruleManagerId) {
                this.$http.get(`/api/v1/admin/rulemanagers(${this.model.ruleManagerId})?$expand=RuleClauses($orderby=ExecutionGroup,ExecutionOrder asc)`).success((ruleManager: any) => {
                    this.ruleManagerModel = ruleManager;
                    this.loadRuleTypeOptions(this.ruleManagerModel.ruleClauses);
                });
            } else {
                this.$http.get(`/api/v1/admin/rulemanagers/default`).success(ruleManager => {
                    this.ruleManagerModel = ruleManager;
                    var ruleTypeName = this.entityDefinition.name;
                    if (ruleTypeName === "carrier" || ruleTypeName === "shipVia") {
                        ruleTypeName = "Shipping";
                    }
                    this.$http.get(`/api/v1/admin/ruletypes?$filter=Name eq '${ruleTypeName}'`).success((ruleType: any) => {
                        if (ruleType.value.length > 0) {
                            this.ruleManagerModel.ruleTypeId = ruleType.value[0].id;
                            this.ruleManagerModel.name = ruleType.value[0].name;
                        } else {
                            this.notificationService.show(NotificationType.Error, `RuleType for '${ruleTypeName}' was not found`);
                        }
                        if (this.ruleManagerModel.ruleTypeId) {
                            this.loadRuleTypeOptions(null);
                        }
                    });
                });
            }
        }

        private loadRuleTypeOptions(rulesData: any[]): void {
            this.$http.get(`/api/v1/admin/ruletypeoptions?$filter=RuleTypeId eq ${this.ruleManagerModel.ruleTypeId}&$orderby=CriteriaType asc`).success((ruleTypeOptions: any) => {
                this.ruleTypeOptions = ruleTypeOptions.value;
                var items = [];
                for (var i = 0; i < this.ruleTypeOptions.length; i++) {
                    for (var j = 0; j < this.criteriatypes.length; j++) {
                        if (this.ruleTypeOptions[i].criteriaType === this.criteriatypes[j].name) {
                            var item = angular.copy(this.criteriatypes[j]);
                            item.ruleTypeOption = this.ruleTypeOptions[i];
                            items.push(item);
                        }
                    }
                }

                this.criteriatypes = items;
                if (rulesData && rulesData.length > 0) {
                    this.fillRuleGroups(rulesData);
                } else {
                    this.ruleGroups = [<IRuleGroupModel>{
                        rules: [this.createRule()],
                        ruleCondition: "And",
                        groupCondition: this.groupsCondition
                    }];
                }

                for (var keyGroup in this.ruleGroups) {
                    for (var keyRule in this.ruleGroups[keyGroup].rules) {
                        if (this.ruleGroups[keyGroup].rules[keyRule].type && (this.ruleGroups[keyGroup].rules[keyRule].type.requiresCriteriaProperty ||
                            this.ruleGroups[keyGroup].rules[keyRule].type.lookupObject)) {
                            this.loadComplete++;
                        }
                    }
                }

                if (!this.loadComplete) {
                    this.initRuleGroups = angular.copy(this.ruleGroups);
                }
            });
        }

        private fillRuleGroups(rulesData: any[]): void {
            rulesData = this.$filter("orderBy")(rulesData, ["executionGroup", "executionOrder"]);
            var group = this.createRuleGroup();
            var groupIndex = 0;
            for (var index = 0; index < rulesData.length; index++) {
                var currentRuleClause = rulesData[index];

                if (index === 0) {
                    group.ruleCondition = currentRuleClause.condition;
                }

                if (groupIndex !== currentRuleClause.executionGroup) {
                    groupIndex = currentRuleClause.executionGroup;
                    if (group.rules.length > 0) {
                        group.groupCondition = rulesData[index - 1].condition;
                        this.groupsCondition = rulesData[index - 1].condition;
                        this.ruleGroups.push(group);
                        group = this.createRuleGroup();
                        group.ruleCondition = currentRuleClause.condition;
                    }
                }

                var criterias = this.getCriteriasByRuleClause(currentRuleClause);
                if (criterias && criterias.length > 0) {
                    var currentCriteria = criterias[0];
                    var currentRule = this.createRule(currentCriteria, currentRuleClause.id);

                    if (currentCriteria.requiresCriteriaProperty) {
                        this.loadProperties(currentRule, "CriteriaProperty", true).then((rule : IRuleModel) => {
                            var ruleClause = rulesData.filter(o => { return o.id === rule.id; })[0];
                            var criteria = this.getCriteriasByRuleClause(ruleClause)[0];
                            if (criteria.parameterDescriptions && criteria.parameterDescriptions.length > 0) {
                                this.fillParameters(rule, criteria, ruleClause);
                            }
                            if (!this.loadComplete) {
                                this.initRuleGroups = angular.copy(this.ruleGroups);
                            }
                        });
                    } else {
                        if (currentCriteria.parameterDescriptions && currentCriteria.parameterDescriptions.length > 0) {
                            this.fillParameters(currentRule, currentCriteria, currentRuleClause);
                        }
                    }

                    if (currentCriteria.requiresGeocode) {
                        currentRule.parameters["CriteriaProperty"] = currentRuleClause.criteriaProperty;
                    }

                    this.loadLookupPluralizedName(currentRule, true);

                    group.rules.push(currentRule);
                    if (index === rulesData.length - 1) {
                        this.ruleGroups.push(group);
                    }
                }
            }
        }

        private loadLookupPluralizedName(rule: IRuleModel, isInit?: boolean): void {
            if (rule.type && rule.type.lookupObject) {
                var lookupObject = rule.type.lookupObject.charAt(0).toLowerCase() + rule.type.lookupObject.substring(1);
                this.entityDefinitionService.getDefinition(lookupObject, "name").then((result: any) => {
                    if (result) {
                        rule.pluralizedlookupObject = result.pluralizedName;
                    }
                    if (isInit) {
                        this.decrimentLoadComplete();
                    }
                });
            }
        }

        private fillParameters(rule: IRuleModel, criteria: any, ruleClause: any): void {
            for (var i = 0; i < criteria.parameterDescriptions.length; i++) {
                var parameter = criteria.parameterDescriptions[i];
                if (parameter.name === "CriteriaProperty") {
                    // handle case sensitivity
                    var matchingProperties = rule.properties.filter(o => { return o.value.toLowerCase() === ruleClause.criteriaProperty.toLowerCase(); });
                    if (matchingProperties.length > 0) {
                        rule.parameters[parameter.name] = matchingProperties[0].value;
                    } else if (rule.type.ruleTypeOption.criteriaProperty.toLowerCase() === "all properties") {
                        rule.parameters[parameter.name] = ruleClause.criteriaProperty.charAt(0).toLowerCase() + ruleClause.criteriaProperty.slice(1);
                    } else {
                        rule.parameters[parameter.name] = ruleClause.criteriaProperty;
                    }
                } else if (parameter.name === "ValueList") {
                    rule.parameters[parameter.name] = ruleClause.valueList;
                } else if (parameter.name === "SimpleValue") {
                    if (criteria.parameterDescriptions[i].valueType === "number") {
                        rule.parameters[parameter.name] = parseFloat(ruleClause.simpleValue);
                    } else if (criteria.lookupObject && criteria.lookupObjectParameterIndex === i) {
                        rule.parameters[parameter.name] = ruleClause.simpleValue.toLowerCase();
                    } else {
                        rule.parameters[parameter.name] = ruleClause.simpleValue;
                    }
                } else if (parameter.name === "ValueMinimum") {
                    var propertiesMin = rule.properties ? rule.properties.filter((prop) => prop.value === rule.parameters["CriteriaProperty"]) : [];
                    if (parameter.valueType === "number" || (propertiesMin && propertiesMin.length > 0)) {
                        rule.parameters[parameter.name] = ruleClause.valueMinimum;
                    } else {
                        rule.parameters[parameter.name] = parseFloat(ruleClause.valueMinimum);
                    }
                } else if (parameter.name === "ValueMaximum") {
                    var propertiesMax = rule.properties ? rule.properties.filter((prop) => prop.value === rule.parameters["CriteriaProperty"]) : [];
                    if (parameter.valueType !== "number" || (propertiesMax && propertiesMax.length > 0)) {
                        rule.parameters[parameter.name] = ruleClause.valueMaximum;
                    } else {
                        rule.parameters[parameter.name] = parseFloat(ruleClause.valueMaximum);
                    }
                } else if (parameter.name === "CriteriaValue") {
                    rule.parameters[parameter.name] = ruleClause.criteriaValue;
                } else if (parameter.name === "ComparisonOperator") {
                    rule.parameters[parameter.name] = ruleClause.comparisonOperator;
                }
            }
        }

        private getCriteriasByRuleClause(ruleClause: any): any {
            return this.criteriatypes.filter((e) => e.name === ruleClause.criteriaType && (!e.requiresCriteriaObject ||
                e.requiresCriteriaObject && e.ruleTypeOption.criteriaObject === ruleClause.criteriaObject));
        }

        private decrimentLoadComplete() {
            this.loadComplete--;
            if (!this.loadComplete) {
                this.initRuleGroups = angular.copy(this.ruleGroups);
            }
        }

        private createRule(type?: any, id?: any): IRuleModel {
            return <IRuleModel>{
                id: id,
                type: type,
                parameters: {}
            };
        }

        private createRuleGroup(): IRuleGroupModel {
            return <IRuleGroupModel>{
                rules: [],
                ruleCondition: "And",
                groupCondition: this.groupsCondition
            };
        }
    }

    angular
        .module("insite-admin")
        .controller("RuleManagerController", RuleManagerController)
        .directive("isaRuleManager", () => {
            return {
                restrict: "E",
                replace: true,
                transclude: true,
                templateUrl: "RuleManager",
                controller: "RuleManagerController",
                controllerAs: "vm",
                bindToController: true,
                scope: {
                    entityDefinition: "=",
                    propertyServiceUri: "=",
                    model: "=",
                    form: "=",
                    isDirtyParameter: "=",
                    initialModel: "="
                }
            }
        });

    angular.module("insite-admin")
        .directive("isaRuleParameterMax", ["$rootScope", ($rootScope) => {
            return {
                require: ["ngModel", "^form"],
                restrict: "A",
                link: ($scope, element, attr: any, ctrs) => {
                    if (attr.parameterName !== "ValueMaximum" || attr.type !== "number") {
                        return;
                    }

                    var ngModel = ctrs[0];
                    if (attr.type === "number") {
                        ngModel.$formatters.push(modelValue => Number(modelValue));
                    }

                    var isForcedValidate = false;
                    var minValue = 0;
                    $scope.$on(`RuleManager-MinParameterChanged${attr.ruleIndex}`, ($event, data) => {
                        isForcedValidate = true;
                        minValue = parseFloat(data);
                        if (data) {
                            attr.isaRuleParameterMin = data;
                        }

                        ngModel.$validate();
                        isForcedValidate = false;
                    });

                    ngModel.$validators.maxValidator = (modelValue, viewValue) => {
                        if (!isForcedValidate) {
                            $rootScope.$broadcast(`RuleManager-MaxParameterChanged${attr.ruleIndex}`, modelValue);
                        }

                        if (attr.isaRuleParameterMin) {
                            minValue = parseFloat(attr.isaRuleParameterMin);
                        }

                        return parseFloat(modelValue) >= minValue;
                    };
                }
            }
        }]);

    angular.module("insite-admin")
        .directive("isaRuleParameterMin", ["$rootScope", ($rootScope) => {
            return {
                require: ["ngModel", "^form"],
                restrict: "A",
                link: ($scope, element, attr: any, ctrs) => {
                    if (attr.parameterName !== "ValueMinimum" || attr.type !== "number") {
                        return;
                    }
                    
                    var ngModel = ctrs[0];
                    if (attr.type === "number") {
                        ngModel.$formatters.push(modelValue => Number(modelValue));
                    }

                    var isForcedValidate = false;
                    var maxValue = 0;
                    $scope.$on(`RuleManager-MaxParameterChanged${attr.ruleIndex}`, ($event, data) => {
                        isForcedValidate = true;
                        maxValue = parseFloat(data);
                        if (data) {
                            attr.isaRuleParameterMax = data;
                        }
                        ngModel.$validate();
                        isForcedValidate = false;
                    });

                    ngModel.$validators.minValidator = (modelValue, viewValue) => {
                        if (!isForcedValidate) {
                            $rootScope.$broadcast(`RuleManager-MinParameterChanged${attr.ruleIndex}`, modelValue);
                        }

                        if (attr.isaRuleParameterMax) {
                            maxValue = parseFloat(attr.isaRuleParameterMax);
                        }

                        return parseFloat(modelValue) <= maxValue;
                    };
                }
            }
        }]);
}