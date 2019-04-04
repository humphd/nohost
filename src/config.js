'use strict';

const url = new URL(location);

/**
 * Various features of the server can be configured by passing options on
 * the query string when registering the nohost-sw.js service worker file.
 * 
 * `route`: `String` value with the route name to use when listening for filesystem
 * path requests. Defaults to `fs`, such that `/fs/path/to/file` would give
 * `/path/to/file`. If the `route` includes multiple levels, pass them on the
 * URL encoded (i.e., `'first%2Fsecond'` for `'/first/second'`).
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
function getNormalizeRoute() {
  let route = url.searchParams.get('route') || 'fs';

  // Only a single / at the front of the route
  route = route.replace(/^\/*/, '/');
  // Only a single / at the end of the route
  route = route.replace(/\/*$/, '');

  return route;
}

module.exports = {
  route: getNormalizeRoute(),
  disableIndexes: url.searchParams.get('disableIndexes') !== null,
  directoryIndex: url.searchParams.get('route') || 'index.html',
  debug: url.searchParams.get('debug') !== null
};
