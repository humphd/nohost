define(function() {

  return {

    isMedia: function(ext) {
      return ext === '.avi' ||
        ext === '.mpeg' ||
        ext === '.mp4' ||
        ext === '.ogg' ||
        ext === '.webm' ||
        ext === '.mov' ||
        ext === '.qt' ||
        ext === '.divx' ||
        ext === '.wmv' ||
        ext === '.mp3' ||
        ext === '.wav';
    },

    isImage: function(ext) {
      return ext === '.png' ||
        ext === '.jpg' ||
        ext === '.pjpg' ||
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
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      //XXX: Some of these media types can be video or audio, prefer video.
      case '.mp4':
        return 'video/mp4';
      case '.mpeg':
        return 'video/mpeg';
      case '.ogg':
      case '.ogv':
        return 'video/ogg';
      case '.mov':
      case '.qt':
        return 'video/quicktime';
      case '.webm':
        return 'video/webm';
      case '.avi':
      case '.divx':
        return 'video/avi';
      case '.mpa':
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/vnd.wave';
      }
      return 'application/octet-stream';
    },

    toDataURL: function(data, type) {
      var blob = new Blob([data], {type: type});
      return URL.createObjectURL(blob);
    }

  };

});