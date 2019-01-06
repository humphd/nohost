'use strict';

const { fs, Path } = require('filer');
const sh = new fs.Shell();

// https://tools.ietf.org/html/rfc2183
function formatContentDisposition(path, stats) {
  const filename = Path.basename(path);
  const modified = stats.mtime.toUTCString();
  return `attachment; filename="${filename}"; modification-date="${modified}"; size=${stats.size};`;
}

function WebServer(route) {
  this.route = route;
}
WebServer.prototype.serve = function(path, formatter, download) {
  const route = this.route;

  return new Promise((resolve) => {
    function buildResponse(responseData) {
      return new Response(responseData.body, responseData.config);
    }

    function serveError(path, err) {
      if(err.code === 'ENOENT') {
        return resolve(buildResponse(formatter.format404(path, err)));
      }
      resolve(buildResponse(formatter.format500(path, err)));
    }

    function serveFile(path, stats) {
      fs.readFile(path, (err, contents) => {
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

    function serveDir(path) {
      sh.ls(path, (err, entries) => {
        if(err) {
          return serveError(path, err);
        }

        const responseData = formatter.formatDir(route, path, entries);
        resolve(new Response(responseData.body, responseData.config));
      });
    }

    fs.stat(path, (err, stats) => {
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

module.exports = WebServer;
