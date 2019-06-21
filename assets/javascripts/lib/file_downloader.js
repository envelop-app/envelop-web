import { publicUserSession } from '../lib/blockstack_client';
import GaiaDocument from '../lib/gaia_document';

const defaultOptions = { decrypt: false, verify: false };

class FileDownloader {
  constructor(username, filename) {
    this.username = username;
    this.filename = filename;
  }

  download() {
    return this.fetchMetadata()
      .then(metadata => Promise.all([metadata, this.fetchFullUrl(metadata)]))
      .then(([metadata, fullUrl]) => {
        const name = metadata.url.split('/').pop();
        return new GaiaDocument(Object.assign({}, metadata, { url: fullUrl }));
      });
  }

  fetchMetadata() {
    return publicUserSession
      .getFile(this.filename, this.options())
      .then(JSON.parse)
  }

  fetchFullUrl(metadata) {
    return publicUserSession.getFileUrl(metadata.url, this.options());
  }

  options() {
    return { ...defaultOptions, username: this.username };
  }
}

export default FileDownloader;
