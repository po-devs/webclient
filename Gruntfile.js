module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        autoprefixer: {
            options: {},
            libs: {
                src: 'libs/css/*.css'
            },
            webclient: {
                src: 'css/*.css'
            }
        },
        useminPrepare: {
            webclient: {
                src: ['index.html'],
                dest: 'dist/'
            }
        },
        usemin: {
            html: 'dist/index.html'
        },
        cssmin: {
            webclient: {
                files: {
                    'dist/css/style.css': 'css/style.css'
                }
            }
        },
        htmlmin: {
            webclient: {
                options: {
                    removeComments: true,
                    collapseBooleanAttributes: true,
                    //collapseWhitespace: true,
                    //removeAttributeQuotes: true,
                    //removeRedundantAttributes: true,
                    //removeOptionalTags: true
                },
                files: {
                    'dist/index.html': 'dist/index.html',
                    'dist/battle.html': 'dist/battle.html',
                    'dist/teambuilder.html': 'dist/teambuilder.html',
                    'dist/user_params.html': 'dist/user_params.html'
                }
            }
        },
        copy: {
            webclient: {
                src: ['index.html', 'battle.html', 'teambuilder.html', 'user_params.html', 'images/**'],
                dest: 'dist/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.registerTask('clean', function () {
        grunt.file.delete('.tmp/');
    });
    grunt.registerTask('min', function () {
        grunt.task.run('copy');

        grunt.task.run('useminPrepare:webclient');
        grunt.config('concat.options.separator', ';');

        grunt.task.run('concat');
        grunt.task.run('uglify');
        grunt.task.run('cssmin');

        grunt.task.run('usemin');
        grunt.task.run('htmlmin');
        grunt.task.run('clean');
    });

    grunt.registerTask('default', ['autoprefixer']);
    grunt.registerTask('optimize', ['autoprefixer', 'min']);
};
