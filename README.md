A web server in your web browser.

This uses [Filer](https://github.com/filerjs/filer) to run a node'js style
POSIX filesystem inside a Service Worker, and handle requests for static files and
directories.

To run it:

```
npm install
npm run dev
```

Open `http://localhost:1234/`, which will install the Service Worker.  You can
then browse into the filesystem via `http://localhost:1234/fs/*`, where `/*` is
a path into the filesystem.

NOTE: I don't currently have a demo up, so the filesystem is empty.  My plan
is to rework this into a module you can include along with Filer to allow
self-hosting of static files in the browser.
