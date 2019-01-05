'use strict';

const { fs } = require('filer');
const sh = new fs.Shell();

function WebServer(route) {
  this.route = route;
}
WebServer.prototype.serve = (path, formatter) => {
  const route = this.route;

  return new Promise((resolve) => {
    function serveError(path, err) {
      if(err.code === 'ENOENT') {
        return resolve(formatter.format404(path, err));
      }
      resolve(formatter.format500(path, err));
    }

    function serveFile(path, stats) {
      fs.readFile(path, (err, contents) => {
        if(err) {
          return resolve(serveError(path, err));
        }

        resolve(formatter.formatFile(path, contents, stats));
      });
    }

    function serveDir(path) {
      sh.ls(path, (err, entries) => {
        if(err) {
          return resolve(serveError(path, err));
        }

        resolve(formatter.formatDir(route, path, entries));
      });
    }

    fs.stat(path, (err, stats) => {
      if(err) {
        return resolve(serveError(path, err));
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
