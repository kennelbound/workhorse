module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-hug');

    var bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
        ' *  License: <%= pkg.license %> */\n';
    var latest = '<%= pkg.name %>';
    var name = '<%= pkg.name %>-v<%= pkg.version%>';

    var devRelease = 'distrib/' + name + '.js';
    var minRelease = 'distrib/' + name + '.min.js';
    var sourceMapMin = 'distrib/' + name + '.min.js';
    var sourceMapUrl = name + '.min.js';

    var lDevRelease = 'distrib/' + latest + '.js';
    var lMinRelease = 'distrib/' + latest + '.min.js';
    var lSourceMapMin = 'distrib/' + latest + '.min.js.map';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ['distrib'],

        hug: {
            advanced: {
                src: 'src/**/*.js',
                dest: devRelease,
                exportedVariable: 'workhorse',
                exports: 'src/exports.js'
            }
        },

        copy: {
            development: { // copy non-minified release file
                src: devRelease,
                dest: lDevRelease
            },
            minified: { // copy minified release file
                src: minRelease,
                dest: lMinRelease
            },
            smMinified: { // source map of minified release file
                src: sourceMapMin,
                dest: lSourceMapMin
            }
        },

        jshint: {
            options: {
                //eqeqeq: true,
                trailing: true
            },
            target: {
                src: ['src/**/*.js', 'test/**/*.js']
            }
        },

        concat: {
            options: {
                banner: bannerContent
            },
            target: {
                src: [devRelease],
                dest: devRelease
            }
        },

        uglify: {
            build: {
                files: [
                    {
                        src: [devRelease],
                        dest: minRelease
                    }
                ],

                options: {
                    banner: bannerContent
                }
            }
        },

        mocha_phantomjs: {
            all: ['test/**/*.html']
        }

    });

    grunt.registerTask('build', ['jshint', 'hug', 'concat', 'uglify', 'copy']);
    grunt.registerTask('test', ['mocha_phantomjs']);
    grunt.registerTask('default', ['build', 'test']);
};