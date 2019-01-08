const jsonFormatter = require('./json-formatter');
const htmlFormatter = require('./html-formatter');
const WebServer = require('./webserver');

/* global workbox */
// TODO: include this via package.json
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

workbox.setConfig();
workbox.skipWaiting();
workbox.clientsClaim();

function install(route) {
  const webServer = new WebServer(route);
  // Route with /path/into/filesystem
  const wwwRegex = new RegExp(`/${route}(/.*)`);
  // Route minus the trailing slash
  const wwwPartialRegex = new RegExp(`/${route}$`);

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
      url.pathname = `/${route}/`;
      return Promise.resolve(Response.redirect(url, 302));
    },
    'GET'
  );
}

self.addEventListener('install', event => {
  // Allow overriding the route we use to listen for filesystem path requests.
  // The default will be `fs` as in `/fs/{path}`.
  const route = new URL(location).searchParams.get('route') || 'fs';
  event.waitUntil(Promise.resolve(install(route)));
});
