const jsonFormatter = require('./json-formatter');
const htmlFormatter = require('./html-formatter');
const WebServer = require('./webserver');

/* global workbox */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

workbox.setConfig();
workbox.skipWaiting();
workbox.clientsClaim();

function install(route) {
  const webServer = new WebServer(route);
  const wwwRegex = new RegExp(`/${route}(/.*)`);

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
}

self.addEventListener('install', event => {
  let route = new URL(location).searchParams.get('route');
  // Hack: need to figure this out via Parcel and passing ?route=...
  route = route || 'fs';
  event.waitUntil(Promise.resolve(install(route)));
});
