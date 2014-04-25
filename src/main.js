requirejs.config({
  baseUrl: 'src/',
  paths: {
    filer: '../lib/filer.min',
    async: '../lib/async',
    xhr: '../shims/xmlhttprequest'
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
        window.location = '?/appmaker-app/index.html';
      });
    });
  }

  function showUI() {
    var ui = document.getElementById('ui');
    ui.style.display = 'block';

    var install = document.getElementById('install');
    var launch = document.getElementById('launch');

    install.addEventListener('click', function() {
      window.location = '?install=app.zip';
    });

    launch.addEventListener('click', function() {
      window.location = '?/appmaker-app/index.html';
    });

    window.scrollTo(0,1);
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
    var bootOption = document.location.search.substring(1).split('=');
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

    // We need to swap out the XHR implementation when loading from the filesystem
    require(['xhr'], function() {
      WebServer.serve(url);
    });
  }

  boot();
});
