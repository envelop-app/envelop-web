import GaiaFile from './lib/gaia_file';

const appDomain = 'https://envelop.app';

function parseUrl() {
  const paths = window.location.pathname.split('/').filter(s => s);
  if (paths.length !== 3) {
    throw(`Invalid download URL (path=${window.location.pathname}`)
  }
  return { hash: paths[2], username: paths[1] };
}

function updatePlaceholderImage(node, file) {
  node.src = `${node.dataset.path}/icon-type-${file.type}.svg`;
  node.alt = file.type;
}

function updateDownloadPage(file) {
  const filetypeNodes = document.querySelectorAll('.ev-filetype');
  filetypeNodes.forEach(node => updatePlaceholderImage(node, file));

  const filenameNodes = document.querySelectorAll('.ev-filename');
  filenameNodes.forEach(node => node.innerText = file.name);

  const filesizeNodes = document.querySelectorAll('.ev-filesize');
  filesizeNodes.forEach(node => node.innerText = file.sizePretty);

  const fileurlNodes = document.querySelectorAll('.ev-fileurl');
  fileurlNodes.forEach(node => node.href = file.url);
}

document.addEventListener("DOMContentLoaded", () => {
  const urlData = parseUrl();

  var username = urlData.username;
  if (!username.includes('.')) {
    username += '.id.blockstack';
  }

  new GaiaFile(appDomain, username, urlData.hash)
    .fetch()
    .then(updateDownloadPage)
    // TODO: .catch(() => /* do something when file doesn't exist */);
});
