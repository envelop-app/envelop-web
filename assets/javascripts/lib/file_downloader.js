import { publicUserSession } from '../lib/blockstack_client';
import GaiaDocument from '../lib/gaia_document';

const defaultOptions = { decrypt: false, verify: false };

class FileDownloader {
  constructor(username, filename) {
    this.username = username;
    this.filename = filename;
  }

  async download() {
    const metadata = await this.fetchMetadata();
    const fullUrl = await this.fetchFullUrl(metadata);
    const name = metadata.url.split('/').pop();
    return new GaiaDocument(Object.assign({}, metadata, { url: fullUrl }));
  }

  async fetchMetadata() {
    const metadataJson = await publicUserSession.getFile(this.filename, this.options());
    return JSON.parse(metadataJson);
  }

  fetchFullUrl(metadata) {
    return publicUserSession.getFileUrl(metadata.url, this.options());
  }

  options() {
    return { ...defaultOptions, username: this.username };
  }
}

export default FileDownloader;
