var nohost = (function(window) {

  // The server's filesystem
  var Filer = require('filer');
  var Path = Filer.Path;
  var fs;

  // List of FSWatchers for files in the filesystem
  var watchers = {};

  // Content helpers from the nohost source
  var Content = require('content');

  // Path and Dir for current nohost url
  var nohostPath = document.location.search.substring(1);
  var nohostDir = Path.dirname(nohostPath);

  // Change a url to a path in the filesystem to a Blob URL
  function rewriteURL(url, encoding, callback) {
    if(!url || /\:?\/\//.test(url) || /\s*data\:/.test(url)) {
      return callback(null, url);
    }

    var path = Path.resolve(nohostDir, url);
    fs.exists(path, function(found) {
      if(!found) {
        return callback(null, url);
      }

      fs.readFile(path, null, function(err, data) {
        if(err) {
          return callback(null, url);
        }
        var mime = Content.mimeFromExt(Path.extname(path));
        callback(null, Content.toDataURL(data, mime));
      });
    });
  }

  // Alter <img> to intercept paths in the filesystem
  function rewireImage() {
    var $Image = window.Image;

    function Image(w, h) {
      var img = new $Image(w, h);
      Object.defineProperty(img, 'src', {
        get: function() {
          return img.getAttribute('src');
        },
        set: function(value) {
          rewriteURL(value, null, function(err, url) {
            img.setAttribute('src', url);
          });
        }
      });
      return img;
    }
    window.Image = Image;
  }

  // Alter <img> to intercept paths in the filesystem
  function rewireScript() {
    var $Image = window.Image;

    function Image(w, h) {
      var img = new $Image(w, h);
      Object.defineProperty(img, 'src', {
        get: function() {
          return img.getAttribute('src');
        },
        set: function(value) {
          rewriteURL(value, null, function(err, url) {
            img.setAttribute('src', url);
          });
        }
      });
      return img;
    }
    window.Image = Image;
  }

  // Alter XMLHttpRequest so it knows about nohost files
  function rewireXHR() {
    require(['xhr']);
  }

  // Setup auto-reload behaviour for watched paths
  function startWatchers() {
    function setupWatchers(watchList) {
      watchList.forEach(function(path) {
        if(watchers[path]) {
          return;
        }
        watchers[path] = fs.watch(path, function(event, filename) {
          Object.keys(watchers).forEach(function(path) {
            watchers[path].close();
          });
          document.location.reload();
        });
      });
    }

    // Get possible list of paths to watch from `data-nohost-watchlist` attribute
    var scripts = document.getElementsByTagName('script');
    for(var i = 0, l = scripts.length; i < l; i++){
      var watchList = scripts[i].getAttribute('data-nohost-watchlist');
      if(watchList && watchList.length) {
        watchList = watchList.split(',');
        setupWatchers(watchList);
        break;
      }
    }
  }

  // Remove things we've added to the JS env that may not be needed
  function cleanEnv() {
    window.define = null;
    window.require = null;
    window.requirejs = null;

    delete window.define;
    delete window.require;
    delete window.requirejs;
  }

  function init() {
    // Our require setup is still alive in the DOM, so we can get at Filer
    fs = new Filer.FileSystem({
      provider: new Filer.FileSystem.providers.Fallback()
    });

    rewireScript();
    rewireImage();
    rewireXHR();
    startWatchers();
    cleanEnv();
  }

  init();

  return {
    fs: function() {
      return fs;
    },
    readFile: function(path, encoding, callback) {
      path = Path.resolve(nohostDir, path);
      fs.readFile(path, encoding, callback);
    },
    rewriteURL: rewriteURL
  };

}(window));
