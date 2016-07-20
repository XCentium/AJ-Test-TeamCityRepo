(<any>angular)
    .module("insite-admin")
    .filter("spaceless", function () {
        return input => {
            if (input) {
                return input.replace(/\s+/g, "_");
            } else {
                return "";
            }
        }
    });