module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            master: {
                files: {
                    'dist/axe-report.min.js': 'src/axe-report.js'
                }
            }
        },
        watch: {
            js: {
                files: ['src/axe-report.js'],
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['uglify']);
};