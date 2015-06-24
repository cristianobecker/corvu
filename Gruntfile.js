module.exports = function (grunt) {


    "use strict";


    var files = {
            css: [
                "source/assets/css/reset.css",
                "source/assets/css/reset.css",
                "source/assets/css/structure.css",
                "source/assets/css/corvu_general.css",
                "source/assets/css/corvu_mobile.css",
                "source/assets/css/corvu_wide.css",
                "source/assets/css/corvu_tablet.css",
                "source/assets/css/corvu_desktop.css",
                "source/assets/css/corvu_maximum.css",
                "source/assets/css/print.css"
            ],
            js: [
                "source/assets/js/plugins/corvu.move.js",
                "source/assets/js/plugins/corvu.content.js",
                "source/assets/js/plugins/corvu.elements.js",
                "source/assets/js/corvu.js"
            ]
        };


    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        build: +new Date(),

        watch: {
            options: {
                interrupt: true
            },
            js: {
                files: files.js,
                tasks: ["jslint"]
            }
        },


        jslint: {
            client: {
                src: files.js,
                directives: {
                    indent: 4
                },
                options: {
                    failOnError: false
                }
            }
        },

        clean: [ "build" ],

        copy: {
            main: {
                files: [
                    { expand: true, src: "*", cwd: "source/", dest: "build/", dot: true },
                    { expand: true, src: "**", cwd: "source/assets/img", dest: "build/assets/img" },
                    { expand: true, src: "*", cwd: "source/assets/js/vendor", dest: "build/assets/js/vendor" },
                    { expand: true, src: "jquery*.js", cwd: "source/assets/js/plugins/", dest: "build/assets/js/plugins" }
                ]
            }
        },

        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %> */\n",
                compress: {},
                report: true
            },
            dist: {
                files: {
                    "build/assets/js/corvu.min.<%= build %>.js": files.js
                }
            }
        },

        cssmin: {
            dist: {
                options: {
                    banner: "/*! <%= pkg.name %> <%= grunt.template.today('dd-mm-yyyy') %> */\n"
                },
                files: {
                    "build/assets/css/corvu.min.<%= build %>.css": files.css
                }
            }
        },


        htmlrefs: {
            dist: {
                src: "source/*.html",
                dest: "build/",
                options: {
                    buildNumber: "<%= build %>",
                }
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "build/index.html": "build/index.html",
                    "build/index_en.html": "build/index_en.html"
                }
            },
        }
    });



    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);



    grunt.registerTask("default", [
        "jslint",
        "clean",
        "copy",
        "uglify",
        "cssmin",
        "htmlrefs",
        "htmlmin"
    ]);

    grunt.registerTask("js", [
        "jslint",
        "watch:js"
    ]);


};
