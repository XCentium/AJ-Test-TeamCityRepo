declare module CKFinder {
    var config: config;

    function popup(options: any): void;

    interface config {
        startupPath: string;
        resourceType: string;
    }
}