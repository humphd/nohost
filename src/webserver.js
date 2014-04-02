define(['filer', 'log', 'handlers', 'content'],
function(Filer, Log, Handlers, Content) {
  var Path = Filer.Path;
  var fs;
  var sh;

  return {

    /**
     * Start the web server. Call this before any other operations.
     */
    start: function(options) {
      options = options || {};
      fs = new Filer.FileSystem({
        flags: options.flags,
        provider: new Filer.FileSystem.providers.Fallback()
      });
      sh = fs.Shell();
    },

    /**
     * Reset (i.e., remove all installed files) the server's root
     */
    reset: function() {
      // Pass the FORMAT flag so the filesystem gets wiped
      this.start({ flags: ['FORMAT'] });
    },

    /**
     * Download a file (e.g., disk image *.zip) into the server's root.
     * Both a url and File/Blob are acceptable.
     */
    download: function(url, callback) {
      if(typeof url === 'string') {
        // Regular url
        sh.wget(url, function(err, path) {
          if(err) {
            Log.error('unable to download filesystem image `' + url + '`');
            return callback(err);
          }
          callback(null, path);
        });
      } else {
        // File/Blob
        var reader = new FileReader();
        reader.onload = function(e) {
          delete reader.onload;
          var buffer = new Uint8Array(e.target.result);
          var path = Path.join('/', url.name);

          fs.writeFile(path, buffer, function(err) {
            if(err) {
              Log.error('unable to download filesystem image');
              return callback(err);
            }
            callback(null, path);
          });
        };
        reader.readAsArrayBuffer(url);
      }
    },

    /**
     * Unzip and install a disk image (*.zip) in the server's root, removing
     * the image file when done.
     */
    install: function(path, callback) {
      sh.unzip(path, function(err) {
        if(err) {
          Log.error('unable to extract filesystem image');
          return callback(err);
        }

        sh.rm(path, function(err) {
          if(err) {
            Log.error('unable to remove filesystem image archive `' + path + '`');
            callback(err);
          }

          Log.info('installed filesystem');
          callback();
        });
      });
    },

    /**
     * Serve the contents of path, invoking the appropriate content handler.
     */
    serve: function(path) {
      fs.stat(path, function(err, stats) {
        if(err) {
          Handlers.handle404(path);
          return;
        }

        // If this is a dir, show a dir listing
        if(stats.isDirectory()) {
          Handlers.handleDir(path, fs);
          return;
        }

        // This is a file, pick the right content handler based on extension
        var ext = Path.extname(path);

        if(Content.isImage(ext)) {
          Handlers.handleImage(path, fs);
        } else if(Content.isMedia(ext)) {
          Handlers.handleMedia(path, fs);
        } else if(Content.isHTML(ext)) {
          Handlers.handleHTML(path, fs);
        } else {
          Handlers.handleFile(path, fs);
        }
      });
    }

  };

});
