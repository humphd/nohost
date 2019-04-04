'use strict';

const { fs, Path } = require('filer');
const { route, disableIndexes, directoryIndex } = require('./config');
const sh = new fs.Shell();

// https://tools.ietf.org/html/rfc2183
function formatContentDisposition(path, stats) {
  const filename = Path.basename(path);
  const modified = stats.mtime.toUTCString();
  return `attachment; filename="${filename}"; modification-date="${modified}"; size=${stats.size};`;
}

const serve = function(path, formatter, download) {
  return new Promise((resolve) => {
    function buildResponse(responseData) {
      return new Response(responseData.body, responseData.config);
    }

    function serveError(path, err) {
      if(err.code === 'ENOENT') {
        return resolve(buildResponse(formatter.format404(path)));
      }
      resolve(buildResponse(formatter.format500(path, err)));
    }

    function serveFile(path, stats) {
      fs.readFile(path, function(err, contents) {
        if(err) {
          return serveError(path, err);
        }

        const responseData = formatter.formatFile(path, contents, stats);

        // If we are supposed to serve this file or download, add headers
        if(responseData.config.status === 200 && download) {
          responseData.config.headers['Content-Disposition'] =
            formatContentDisposition(path, stats);
        }

        resolve(new Response(responseData.body, responseData.config));
      });
    }

    // Either serve /index.html (default index) or / (directory listing)
    function serveDir(path) {

      function maybeServeIndexFile() {
        const indexPath = Path.join(path, directoryIndex);

        fs.stat(indexPath, function(err, stats) {
          if(err) {
            if(err.code === 'ENOENT' && !disableIndexes) {
              // Fallback to a directory listing instead
              serveDirListing();
            } else {
              // Let the error (likely 404) pass through instead
              serveError(path, err);
            }
          } else {
            // Index file found, serve that instead
            serveFile(indexPath, stats);
          }
        });
      }

      function serveDirListing() {
        sh.ls(path, function(err, entries) {
          if(err) {
            return serveError(path, err);
          }
  
          const responseData = formatter.formatDir(route, path, entries);
          resolve(new Response(responseData.body, responseData.config));
        });
      }

      maybeServeIndexFile();
    }

    fs.stat(path, function(err, stats) {
      if(err) {
        return serveError(path, err);
      }

      if(stats.isDirectory()) {
        serveDir(path);
      } else {
        serveFile(path, stats);
      }
    });
  });
};

module.exports.serve = serve;
