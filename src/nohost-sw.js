const jsonFormatter = require('./json-formatter');
const htmlFormatter = require('./html-formatter');
const { serve } = require('./webserver');
const { debug, route } = require('./config');

/* global workbox */
// TODO: include this via package.json
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.1.1/workbox-sw.js');

workbox.setConfig({ debug });

// Route with trailing slash (i.e., /path/into/filesystem)
const wwwRegex = new RegExp(`${route}(/.*)`);
// Route minus the trailing slash
const wwwPartialRegex = new RegExp(`${route}$`);

workbox.routing.registerRoute(
  wwwRegex,
  ({ url }) => {
    // Pull the filesystem path off the url 
    let path = url.pathname.match(wwwRegex)[1];
    // Deal with encoding in the filename (e.g., spaces as %20)
    path = decodeURI(path);

    // Allow passing `?json` on URL to get back JSON vs. raw response
    const formatter =
      url.searchParams.get('json') !== null
        ? jsonFormatter
        : htmlFormatter;

    // Allow passing `?download` or `dl` to have the file downloaded vs. displayed
    const download =
      url.searchParams.get('download') !== null ||
      url.searchParams.get('dl') !== null;
        
    return serve(path, formatter, download);
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

workbox.core.skipWaiting();
workbox.core.clientsClaim();
