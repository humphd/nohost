module.exports = function(grunt) {

  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: 'test.zip',
          mode: 'zip'
        },
        files: [
          {expand: true, src: ['test/*.*'], dest: './'}
        ]
      }
    },

    jshint: {
      all: [ 'src/**/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('default', ['jshint', 'compress']);
};
