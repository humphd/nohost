nohost
======

Nohost simulates a static content web server in your browser.  It does this by using JavaScript to read the query string out of the address bar, and then overwrites what was *actually* served with content from the [Filer](https://github.com/js-platform/filer) virtual filesystem at that path location.  Since the filesystem survives between executions of the page, there is stability between various requests.

Each request for a path involves rewriting.  The requested file read and parsed, and processed so as to inline any external resources (e.g., images, stylesheets, etc).  When the document is done being processed, it is again turned into text, and `document.write` is used to replace the web server's boot page with the new content.  Some special pages are synthesized, similar to how a normal web server works.  For example: directory listings and images.

*Note that this doesn't actually "serve" anything.*  So one tab cannot make an XMLHttpRequest() of another--much less could another browser on your system access the data via a local URI.  But it does make it easier to do in-browser, live previews of complex web sites and applications that span many files.

###Demo

You can try a [demo here](http://humphd.github.io/nohost).

nohost boots the web server whenever you load its `index.html` page. Boot options are read from the query string and then actions are taken using the filesystem. 

Like any web server, you must first install what you want to serve.  Files are then installed in the filesystem using the `?install` boot option, and choosing a disk image (*.zip). A demo disk image is included, which can be installed by doing the following:

[http://humphd.github.io/nohost?install=webmaker-kits-gh-pages.zip](http://humphd.github.io/nohost?install=webmaker-kits-gh-pages.zip)

Once installed, the filesystem will survive the server being started and stopped (i.e., closing the window).  If you want to clear the filesystem, use the `?reset` boot option:

[http://humphd.github.io/nohost?reset](http://humphd.github.io/nohost?reset)

Now that files are installed into the fileystem, you can browse them by adding a path to the query string:

* Web Root - [http://humphd.github.io/nohost?/](http://humphd.github.io/nohost?/)
* An HTML page - [http://humphd.github.io/nohost/?/webmaker-kits-gh-pages/kit.html](http://humphd.github.io/nohost/?/webmaker-kits-gh-pages/kit.html)

Any path not found in the filesystem will produce a 404:

[http://humphd.github.io/nohost/?/nothere](http://humphd.github.io/nohost/?/nothere)
