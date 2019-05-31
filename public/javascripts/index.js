document.addEventListener("DOMContentLoaded", event => {
  function bindDownloadLinks() {
    const links = document.querySelectorAll('.download-file');
    links.forEach((link) => {
      link.addEventListener('click', (evt) => {
        evt.preventDefault();
        saveAs(link.href, link.href.split('/').pop())
      }, true);
    })
  }
  bindDownloadLinks();
})
