define(function() {

  return {

    isImage: function(ext) {
      return ext === '.png' ||
        ext === '.jpg' ||
        ext === '.jpeg'||
        ext === '.gif';
    },

    isHTML: function(ext) {
      return ext === '.html' || ext === '.htm';
    },

    mimeFromExt: function(ext) {
      switch(ext) {
      case '.css':
        return 'text/css';
      case '.js':
        return 'text/javascript';
      case '.svg':
        return 'image/svg+xml';
      case '.png':
        return 'image/png';
      case '.ico':
        return 'image/x-icon';
      case '.jpg':
      case '.jpeg':
        return 'image.jpeg';
      case '.gif':
        return 'image/gif';
      }
      return 'application/octet-stream';
    },

    toDataURL: function(data, type) {
      var blob = new Blob([data], {type: type});
      return URL.createObjectURL(blob);
    }

  };

});