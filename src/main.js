requirejs.config({
  baseUrl: 'src/',
  paths: {
    filer: '../shim/filer.min',
    async: '../lib/async'
  }
});

requirejs(['filer', 'webserver'], function(Filer, WebServer) {
  var Path = Filer.Path;

  function showUI() {
    var ui = document.getElementById('ui');
    ui.style.display = 'block';

    // Listen for user specified zip files to install
    var upload = document.getElementById('upload');
    upload.addEventListener('change', function() {
      var file = this.files[0];
      WebServer.download(file, function(err, path) {
        // XXX deal with err
        WebServer.install(path, function() {
          window.location = '?/';
        });
      });
    }, false);
  }

  /**
   * Boot options and Web Server paths are given using the query string.
   * Valid boot options include:
   *
   * ?install=path/to/disk/image.zip --> installs image.zip into web root
   * ?reset --> clears all files from web root
   * ?/path/to/file --> serves a path from the web root
   */
  function boot() {
    var bootOption = location.search.substring(1).split('=');
    var option = bootOption[0];
    var value = bootOption[1];

    // If the DOM isn't ready, wait for it so document.write works fully
    if(document.readyState !== 'complete') {
      addEventListener('DOMContentLoaded', boot, false);
      return;
    }

    WebServer.start();

    // Case 1: no boot option, show server UI
    if(!option) {
      showUI();
      return;
    }

    // Case 2: boot command (i.e., doesn't start with a '/')
    if(/^[^/]/.test(option)) {
      if(option === 'reset') {
        WebServer.reset();
        showUI();
        return;
      }
      if(option === 'install') {
        WebServer.download(value, function(err, path) {
          // XXX deal with err
          WebServer.install(path, function() {
            // Show the web root
            window.location = '?/';
          });
        });
        return;
      }
    }

    // Case 3: a path was given into the web root, try to serve it
    WebServer.serve(option);
  }

  boot();
});
