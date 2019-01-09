# nohost

A web server in your web browser.

## Overview

nohost uses [Filer](https://github.com/filerjs/filer) to run a node'js style,
POSIX filesystem inside a Service Worker, and handle requests for static files and
directories.

The most likely use case for nohost would be an app that uses Filer to run a filesystem
in the window, and then use nohost to provide a way to interact with that filesystem
in the browser via URLs, like one would with Apache or another web server hosting static files.

## Example

NOTE: I don't currently have a full demo up (TODO), so the default filesystem is empty.  My plan
is to rework this into a module people can include along with Filer to allow
self-hosting of static files in the browser.

Until then, here's what nohost looks like running with a fileystem manually created:

![Example running](screenshots/demo.png)

Clicking a link does what you'd expect, serving the file to the browser via the Service Worker.

## Installation

To run it:

```
npm install
npm run build
```

The nohost Service Worker will be built in `dist/nohost-sw.js`. NOTE: you can also use `npm run dev` to also start a web server.

Now register nohost's Service Worker in your app at startup:

```js
if(!('serviceWorker' in navigator)) {
  console.warn('unable to initialize nohost service worker: not supported.');
} else {
  navigator.serviceWorker
    .register('./nohost-sw.js') // see configuration options below
    .catch(err => {
      console.error(`unable to register nohost service worker: ${err.message}`);
    });
}
```

## Configure Web Server

Various features of the nohost web server can be configured by passing options on
the query string when registering the `nohost-sw.js` Service Worker:

* `route` (`String`): with the route name to use when listening for filesystem path requests. Defaults to `fs`, such that `/fs/path/to/file` would respond with `/path/to/file`

* `disableIndexes` (`Boolean`, present or absent): directory indexes (i.e., listings) will *not* be shown.  By default they *will* be shown. If defined, users will have to know the filename they wish to get back from the server.

* `directoryIndex` (`String`): overrides the default directory index filename, used when a directory path is given. Defautls to `index.html`. For example, `/fs/` would return `/fs/index.html` by default (if present).  If another name is specified here, that filename will be used instead.

For example:

```js
// Use /www for the server route, and disable directory listings
navigator.serviceWorker
  .register('./nohost-sw.js?route=www&disableIndexes');
```

## Browse Filesystem

After the Service Worker is installed, you can then browse into the filesystem via
the specified route (defaults to `/fs/*`). For example, if running the demo:
`http://localhost:8080/fs/*`, where `/*` is a path into the filesystem.

To get metadata about files/directories vs. contents, add `?json` to the URL.
For example: `http://localhost:8080/fs/dir?json`

To download instead of view files in the browser, add `?download` or `?dl` to the URL.
For example: `http://localhost:8080/fs/path/to/file.png?dl`
