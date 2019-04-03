const jsonFormatter = require('./json-formatter');
const htmlFormatter = require('./html-formatter');
const WebServer = require('./webserver');

/**
 * Various features of the server can be configured by passing options on
 * the query string when registering the nohost-sw.js service worker file.
 * 
 * `route`: `String` value with the route name to use when listening for filesystem
 * path requests. Defaults to `fs`, such that `/fs/path/to/file` would give `/path/to/file`
 * 
 * `disableIndexes`: if present (i.e., `Boolean`), directory indexes will not be shown.
 * Users will have to know the filename they wish to get back from the server.  Defaults
 * to `true` (i.e. directory indexes are shown).
 * 
 * `directoryIndex`: `String` value used to override the default directory index
 * used when a filename isn't given. Defautls to `index.html`. For example,
 * `/fs/` would return `/fs/index.html` by default, or use another name if
 * specified.
 * 
 * `debug`: if present (i.e., `Boolean`), enable workbox debug logging
 */
const config = (function(location) {
  const url = new URL(location);

  return {
    route: url.searchParams.get('route') || 'fs',
    disableIndexes: url.searchParams.get('disableIndexes') !== null,
    directoryIndex: url.searchParams.get('route') || 'index.html',
    debug: url.searchParams.get('debug') !== null
  };
}(location));

/* global workbox */
// TODO: include this via package.json
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');

workbox.setConfig({
  debug: config.debug
});

addEventListener('install', () => self.skipWaiting());
addEventListener('activate', () => self.clients.claim());

// This will trigger the importScripts() for workbox.strategies and its dependencies
// See workaround in https://developers.google.com/web/tools/workbox/modules/workbox-sw#avoid_async_imports
workbox.loadModule('workbox-strategies');

function debug(msg) {
  if(!config.debug) return;
  // eslint-disable-next-line no-console
  console.log(`[nohost debug] ${msg}`);
}

/**
 * Given a route string, make sure it follows the pattern we expect:
 *  - no escaped characters
 *  - begins with a `/`
 *  - ends with a no trailing `/`
 * 
 * If we were passed `'fs'`, we would normalize to `/fs` and
 * if we were passed `'first%2Fsecond'`, `'/first/second'`
 * 
 * @param {String} route 
 */
function normalizeRoute(route) {
  route = decodeURIComponent(route);
  // Only a single / at the front of the route
  route = route.replace(/^\/*/, '/');
  // Only a single / at the end of the route
  route = route.replace(/\/*$/, '');

  return route;
}

function install(config) {
  const route = normalizeRoute(config.route);
  const webServer = new WebServer(config);
  // Route with trailing slash (i.e., /path/into/filesystem)
  const wwwRegex = new RegExp(`${route}(/.*)`);
  // Route minus the trailing slash
  const wwwPartialRegex = new RegExp(`${route}$`);

  debug(`route=${route} wwwRegex=${wwwRegex}`);

  workbox.routing.registerRoute(
    wwwRegex,
    ({ url }) => {
      // Pull the filesystem path off the url 
      const path = url.pathname.match(wwwRegex)[1];

      // Allow passing `?json` on URL to get back JSON vs. raw response
      const formatter =
        url.searchParams.get('json') !== null
          ? jsonFormatter
          : htmlFormatter;

      // Allow passing `?download` or `dl` to have the file downloaded vs. displayed
      const download =
        url.searchParams.get('download') !== null ||
        url.searchParams.get('dl') !== null;
          
      return webServer.serve(path, formatter, download);
    },
    'GET'
  );

  // Redirect if missing the / on our expected route
  workbox.routing.registerRoute(
    wwwPartialRegex,
    ({ url }) => {
      url.pathname = `${route}/`;
      return Promise.resolve(Response.redirect(url, 302));
    },
    'GET'
  );
}

self.addEventListener('install', function(event) {
  event.waitUntil(Promise.resolve(install(config)));
});
