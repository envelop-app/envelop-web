import FileDownloader from '../lib/file_downloader';

function parseUrl() {
  const paths = window.location.pathname.split('/').filter(s => s);
  if (paths.length !== 3) {
    throw(`Invalid download URL (path=${window.location.pathname}`)
  }
  return { hash: paths[2], username: paths[1] };
}

function updatePlaceholderImage(node, gaiaDocument) {
  node.src = `${node.dataset.path}/icon-type-${gaiaDocument.getType()}.svg`;
  node.alt = gaiaDocument.type;
}

function updateDownloadPage(gaiaDocument) {
  const filetypeNodes = document.querySelectorAll('.ev-filetype');
  filetypeNodes.forEach(node => updatePlaceholderImage(node, gaiaDocument));

  const filenameNodes = document.querySelectorAll('.ev-filename');
  filenameNodes.forEach(node => node.innerText = gaiaDocument.getName());

  const filesizeNodes = document.querySelectorAll('.ev-filesize');
  filesizeNodes.forEach(node => node.innerText = gaiaDocument.getSizePretty());

  const fileurlNodes = document.querySelectorAll('.ev-fileurl');
  fileurlNodes.forEach(node => node.href = gaiaDocument.url);
}

document.addEventListener("DOMContentLoaded", () => {
  const urlData = parseUrl();

  var username = urlData.username;
  if (!username.includes('.')) {
    username += '.id.blockstack';
  }

  new FileDownloader(username, urlData.hash)
    .download()
    .then(updateDownloadPage)
    // TODO: .catch(() => /* do something when file doesn't exist */);
});
