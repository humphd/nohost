requirejs.config({
  baseUrl: 'src/',
  paths: {
    filer: '../lib/filer.min',
    async: '../lib/async'
  }
});

requirejs(['filer', 'webserver'], function(Filer, WebServer) {
  var Path = Filer.Path;

  function install(file) {
    var status = document.getElementById('status');
    status.innerHTML = "Downloading zip file...";
    status.style.display = 'block';

    WebServer.download(file, function(err, path) {
      if(err) {
        status.className = "alert alert-danger";
        status.innerHTML = "Error downloading zip file!";
        return;
      }

      status.innerHTML = "Extracting zip file...";
      WebServer.install(path, function(err) {
        if(err) {
          status.className = "alert alert-danger";
          status.innerHTML = "Error downloading zip file!";
          return;
        }
        window.location = '?/';
      });
    });
  }

  function showUI() {
    var ui = document.getElementById('ui');
    ui.style.display = 'block';

    // Listen for user specified zip files to install
    var upload = document.getElementById('upload');
    upload.addEventListener('change', function() {
      var file = this.files[0];
      install(file);
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
        install(value);
        return;
      }
    }

    // Case 3: a path was given into the web root, try to serve it.
    // Strip any server added trailing slash (unless we have '/').
    var url = option === '/' ? option : option.replace(/\/$/, '');
    WebServer.serve(url);
  }

  boot();
});
