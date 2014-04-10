/**
 * XMLHttpRequest (1 and 2) with special override to pull
 * files out of the filesystem instead of touching network.
 */

define(['filer'], function(Filer) {

  var XMLHttpRequest = window.XMLHttpRequest;

	function $XMLHttpRequest() {
    var self = new XMLHttpRequest();
    var requestUrl;

    function decode(data) {
      return (new TextDecoder('utf8')).decode(data);
    }

    var open = self.open;
    self.open = function(method, url, async, user, password) {
      if(url.indexOf('//') === -1) {
        requestUrl = nohost.Path.resolve(nohost.dir, url);
      } else {
        open.apply(self, arguments);
      }
    };

    var send = self.send;
    self.send = function() {
      if(!requestUrl) {
        send.apply(self, arguments);
        return;
      }

      nohost.readFile(requestUrl, null, function(err, data) {
        if(err) {
          // TODO: deal with addEventListener
          if(typeof self.onerror === 'function') {
            return self.onerror(err);
          }
          console.log('err', err);
          return;
        }

        // Replace the native XHR properties with our own
        delete self.readyState;
        delete self.status;
        delete self.statusText;
        delete self.response;
        delete self.responseText;

        self.readyState = 4;
        self.status = 200;
        self.statusText = 'OK';

        var responseType = self.responseType;
        if(!responseType || responseType === '') {
          responseType = 'text';
        }
        switch(responseType) {
        case 'text':
          self.response = decode(data);
          self.responseText = self.response;
          break;
        case 'arraybuffer':
          self.response = data.buffer;
          break;
        case 'blob':
          self.response = new Blob([data], {type: 'application/octet-binary'});
          break;
        case 'document':
          // TODO: mime type override here for xml, html, ...?
          self.response = new DOMParser(decode(data), 'text/html');
          break;
        case 'json':
          try {
            self.response = JSON.parse(decode(data));
          } catch(e) { console.log(e); }
          break;
        }

        if(typeof self.onreadystatechange === 'function') {
          self.onreadystatechange();
        }
        if(typeof self.onload === 'function') {
          // TODO: deal with addEventListener
          self.onload();
        }
      });
    };

    return self;
  }

	window.XMLHttpRequest = $XMLHttpRequest;

});
