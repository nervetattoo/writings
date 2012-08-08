module.exports = function(grunt) {

  grunt.initConfig({
    lint: {
      files: ["*.js"]
    },

    watch: {
      files: "<config:lint.files>",
      tasks: "lint"
    },

    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: false,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        node: true
      },
      globals: {
          Backbone: true,
          $: true,
          _: true,
          Stack: true
      }
    }
  });

  // Default task.
  grunt.registerTask("default", "lint");

};
