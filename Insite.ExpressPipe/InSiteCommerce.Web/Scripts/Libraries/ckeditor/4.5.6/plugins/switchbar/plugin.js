/**
 * This plugin was created so that to give the possibility to switch between 
 * the basic and full toolbars
 */
(function () {
    var buttonName = "SwitchBar";
    var pluginCommand = "switchbar";
    var currentBar = "";

    var commandDefinition =
    {
        exec: function (editor) {
            editor.config.switchBarDefault = currentBar === editor.config.switchBarSimple
                ? editor.config.switchBarReach
                : editor.config.switchBarSimple;
            editor.config.toolbar = editor.config.switchBarDefault;

            //the only way is to destroy the editor and recreate it again with new configurations
            var areaId = editor.name;
            var config = editor.config;
            editor.destroy();
            CKEDITOR.replace(areaId, config);
        },
        editorFocus: false,
        canUndo: false
    };

    CKEDITOR.plugins.add(pluginCommand,
    {
        init: function (editor) {
            currentBar = editor.config.switchBarDefault;
            var pluginIcon = currentBar === editor.config.switchBarSimple
                ? editor.config.switchBarSimpleIcon
                : editor.config.switchBarReachIcon;

            editor.addCommand(pluginCommand, commandDefinition);
            editor.ui.addButton(buttonName,
            {
                "label": "Switch Toolbar",
                icon: CKEDITOR.getUrl(this.path) + "images/" + pluginIcon,
                command: pluginCommand
            });
        }
    });
})();

/**
 * The simple toolbar
 * @type string
 */
CKEDITOR.config.switchBarSimple = "Basic";

/**
 * The reach toolbar
 * @type string
 */
CKEDITOR.config.switchBarReach = "Full";

/**
 * The default toolbar which will be set up at the beginning
 * @type string
 */
CKEDITOR.config.switchBarDefault = "Basic";

/**
 * The image to the icong for simple toolbar
 * @type string
 */
CKEDITOR.config.switchBarSimpleIcon = "maximise.gif";

/**
 * The image to the icong for reach toolbar
 * @type string
 */
CKEDITOR.config.switchBarReachIcon = "minimise.gif";
