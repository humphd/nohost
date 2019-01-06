function format404(url) {
  return {
    body: `The requested URL ${url} was not found on this server.`,
    config: {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' }
    }
  };
}

function format500(path, err) {
  return {
    body: `Internal Server Error accessing ${path}: ${err.message}`,
    config: {
      status: 500,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' }
    }
  };
}

function formatDir(route, path, entries) {
  return {
    body: JSON.stringify(entries),
    config: {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }
  };
}

function formatFile(path, contents, stats) {
  return {
    body: JSON.stringify(stats),
    config: {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    }
  };
}

module.exports = {
  format404,
  format500,
  formatDir,
  formatFile
};
