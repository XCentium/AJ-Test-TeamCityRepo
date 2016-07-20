/// <binding BeforeBuild='build' ProjectOpened='watch' />
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        teamcity: {
            all: {}
        },

        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({ browsers: ['last 2 versions'] })
                ]
            },

            admin: {
                files: {
                    //For now just target the admin css file... don't want to mess with the commerce stuff right now...
                    'styles/admin/admin.css': 'styles/admin/admin.css'
                }
            }
        },

        sass: {
            options: {
                style: "expanded",
                compass: true
            },

            admin: {
                files: [{
                    expand: true,
                    src: "styles/admin/admin.scss",
                    ext: ".css"
                }]
            },
            
            foundationApps: {
                files: [{
                    expand: true,
                    src: "styles/admin/foundation-apps.scss",
                    ext: ".css"
                }]
            },
            
            themes: {
                files: [{
                    expand: true,
                    src: "themes/**/*.scss",
                    ext: ".css"
                }]
            },

            //TODO: Eventually get rid of this one...
            styles: {
                files: [{
                    expand: true,
                    src: "styles/*.scss",
                    ext: ".css"
                }]
            },
        },

        watch: {

            admin: {
                files: ["styles/admin/**/*.scss", "!styles/admin/_foundation-*.scss"],
                tasks: ["sass:admin", "postcss:admin"]
            },
            
            foundationApps: {
                files: "styles/admin/_foundation-*.scss",
                tasks: ["sass:foundationApps"]
            },
            
            themes: {
                files: "themes/**/*.scss",
                tasks: ["sass:themes"]
            },

            //TODO: Eventually get rid of this one...
            styles: {
                files: "styles/*.scss",
                tasks: ["sass:styles"]
            },
        }
    });

    grunt.registerTask("default", ["teamcity", "watch"]);
    grunt.registerTask("build", [
        "sass:admin",
        "sass:foundationApps",
        "sass:themes",
        "sass:styles",
        "postcss:admin"
    ]);
};