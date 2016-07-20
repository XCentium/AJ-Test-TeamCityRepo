module insite_admin {
    "use strict";

    export class DirectiveFactory {
        public static GetFactoryFor<T extends ng.IDirective>(directiveToCreate: Function): ng.IDirectiveFactory {
            var factory = (...args: any[]): T => {
                var directive = <any>directiveToCreate;
                return new directive(args);
            };

            factory.$inject = directiveToCreate.$inject;
            return factory;
        }
    }
}