const { isMedia, isImage, getMimeType } = require('./content-type');
const { path } = require('filer');

const iconImage = require('../icons/image2.png');
const iconFolder  = require('../icons/folder.png');
const iconMovie = require('../icons/movie.png');
const iconText = require('../icons/text.png');
const iconUnknown = require('../icons/unknown.png');
const iconBack = require('../icons/back.png');
const iconBlank = require('../icons/blank.png');

// 20-Apr-2004 17:14
const formatDate = d => {
  const day = d.getDate();
  const month = d.toLocaleString('en-us', { month: 'short' });
  const year = d.getFullYear();
  const hours = d.getHours();
  const mins = d.getMinutes();
  return `${day}-${month}-${year} ${hours}:${mins}`;
};

const formatSize = s => {
  const units = ['', 'K', 'M'];
  if (!s) {
    return '-';
  }
  const i = Math.floor(Math.log(s) / Math.log(1024)) | 0;
  return Math.round(s / Math.pow(1024, i), 2) + units[i];
};

const formatRow = (
  icon = iconUnknown,
  alt = '[   ]',
  href,
  name,
  modified,
  size
) => {
  modified = formatDate(new Date(modified));
  size = formatSize(size);

  return `<tr><td valign='top'><img src='${icon}' alt='${alt}'></td><td>
          <a href='${href}'>${name}</a></td>
          <td align='right'>${modified}</td>
          <td align='right'>${size}</td><td>&nbsp;</td></tr>`;
};

const footerClose = '<address>nohost (Web)</address></body></html>';

/**
 * Send an Apache-style 404
 */
function format404(url) {
  const body = `
    <!DOCTYPE html>
    <html><head>
    <title>404 Not Found</title>
    </head><body>
    <h1>Not Found</h1>
    <p>The requested URL ${url} was not found on this server.</p>
    <hr>${footerClose}`;

  return {
    body,
    type: 'text/html',
    status: 404
  };
}

/**
 * Send an Apache-style 500
 */
function format500(path, err) {
  const body = `
    <!DOCTYPE html>
    <html><head>
    <title>500 Internal Server Error</title>
    </head><body>
    <h1>Internal Server Error</h1>
    <p>The server encountered an internal error while attempting to access ${path}.</p>
    <p>The error was: ${err.message}.</p>
    <hr>${footerClose}`;

  return {
    body,
    type: 'text/html',
    status: 500
  };
}

/**
 * Send an Apache-style directory listing
 */
function formatDir(route, dirPath, entries) {
  const parent = path.dirname(dirPath);
  const header = `
    <!DOCTYPE html>
    <html><head><title>Index of ${dirPath}</title></head>
    <body><h1>Index of ${dirPath}</h1>
    <table><tr><th><img src='${iconBlank}' alt='[ICO]'></th>
    <th><b>Name</b></th><th><b>Last modified</b></th>
    <th><b>Size</b></th><th><b>Description</b></th></tr>
    <tr><th colspan='5'><hr></th></tr>
    <tr><td valign='top'><img src='${iconBack}' alt='[DIR]'></td>
    <td><a href='/www${parent}'>Parent Directory</a></td><td>&nbsp;</td>
    <td align='right'>  - </td><td>&nbsp;</td></tr>`;
  const footer = `<tr><th colspan='5'><hr></th></tr></table>${footerClose}`;

  const rows = entries.map(entry => {
    const ext = path.extname(entry.name);
    const href = `/${route}${path.join(dirPath, entry.name)}`;
    let icon;
    let alt;

    if (entry.type === 'DIRECTORY') {
      icon = iconFolder;
      alt = '[DIR]';
    } else {
      if (isImage(ext)) {
        icon = iconImage;
        alt = '[IMG]';
      } else if (isMedia(ext)) {
        icon = iconMovie;
        alt = '[MOV]';
      } else {
        icon = iconText;
        alt = '[TXT]';
      }
    }

    return formatRow(icon, alt, href, entry.name, entry.mtime, entry.size);
  }).join('\n');

  return {
    type: 'text/html',
    status: 200,
    body: header + rows + footer
  };
}

function formatFile(path, content) {
  return {
    body: content,
    type: getMimeType(path),
    status: 200
  };
}

module.exports = {
  format404,
  format500,
  formatDir,
  formatFile
};
