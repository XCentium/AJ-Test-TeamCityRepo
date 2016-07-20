(function (factory) {
    if (typeof define == 'function' && define.amd)
        define(['picker', 'jquery'], factory)
    else factory(Picker, jQuery)
}(function (Picker, $) {
    Picker.extend('pickatime', {})
}));