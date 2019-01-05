const mime = require('mime-types');

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#Audio_and_video_types
function isMedia(path) {
  let mimeType = mime.lookup(path);
  if(!mimeType) {
    return false;
  }

  mimeType = mimeType.toLowerCase();

  // Deal with OGG special case
  if(mimeType === 'application/ogg') {
    return true;
  }

  // Any thing else with `audio/*` or `video/*` is "media"
  return mimeType.startsWith('audio/') || mimeType.startsWith('video/');
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#Image_types
function isImage(path) {
  const mimeType = mime.lookup(path);
  if(!mimeType) {
    return false;
  }

  return mimeType.toLowerCase().startsWith('image/');
}

function getMimeType(path) {
  return mime.lookup(path) || 'application/octet-stream';
}

module.exports = {
  isMedia,
  isImage,
  getMimeType
};
