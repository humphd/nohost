function format404(url) {
  return {
    body: `The requested URL ${url} was not found on this server.`,
    type: 'application/json',
    status: 404
  };
}

function format500(path, err) {
  return {
    body: `Internal Server Error accessing ${path}: ${err.message}`,
    type: 'application/json',
    status: 500
  };
}

function formatDir(route, path, entries) {
  return {
    body: JSON.stringify(entries),
    type: 'application/json',
    status: 200
  };
}

function formatFile(path, contents, stats) {
  return {
    type: 'application/json',
    body: JSON.stringify(stats),
    status: 200
  };
}

module.exports = {
  format404,
  format500,
  formatDir,
  formatFile
};
