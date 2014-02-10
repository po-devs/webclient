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
        }
    });

    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.registerTask('default', ['autoprefixer']);
};
