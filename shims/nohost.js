/**
 * The nohost.js shim is the first thing loaded by any page
 * being served from the nohost server (ie., it gets injected
 * before all other scripts). It is used to alter the environment
 * so dynamic changes requiring data from the filesystem will
 * continue to work in the nohost served page.
 */
var nohost = (function(window) {

  // Get the stashed require env off the document
  var require = document.require;

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

  // Alter <script> to intercept paths in the filesystem
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
    window.XMLHttpRequest = require('xhr');
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

  function init() {
    // Our require setup is still alive in the DOM, so we can get at Filer
    fs = new Filer.FileSystem({
      provider: new Filer.FileSystem.providers.Fallback()
    });

    rewireScript();
    rewireImage();
    rewireXHR();
    startWatchers();
  }

  init();

  return {
    Filer: Filer,
    Path: Path,
    dir: nohostDir,

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
