module.exports = function(grunt) {

  grunt.initConfig({
    clean: ['test.zip'],

    zip: {
      'test.zip': [ 'test/**/*' ]
    },

    jshint: {
      all: [ 'src/**/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['jshint', 'clean', 'zip']);
};
