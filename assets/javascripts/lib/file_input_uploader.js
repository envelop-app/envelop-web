import { Random } from 'random-js'
import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';

const publicFileOptions = { encrypt: false, verify: false };

class FileInputUploader {
  constructor(file) {
    this.file = file;
    this.reader = new FileReader();
    this.longHash = new Random().string(14);
    this.shortHash = new Random().string(6);
  }

  upload() {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        resolve(this.uploadRawFile(evt.target.result).then(() => true));
      }
      this.reader.readAsArrayBuffer(this.file);
    });
  }

  uploadRawFile(contents) {
    const filename = `${this.longHash}/${this.file.name}`;
    return this.putPublicFile(filename, contents, { contentType: 'application/octet-stream' })
      .then(() => this.uploadGaiaDocument());
  }

  uploadGaiaDocument() {
    const gaiaDocument = this.buildGaiaDocument();
    return this.putPublicFile(gaiaDocument.id, JSON.stringify(gaiaDocument))
      .then(() => this.updateIndex(gaiaDocument));
  }

  updateIndex(gaiaDocument) {
    const gaiaIndex = new GaiaIndex();
    return gaiaIndex.addDocument(gaiaDocument);
  }

  putPublicFile(filename, contents, options = {}) {
    const opts = Object.assign({}, publicFileOptions, options);
    return privateUserSession.putFile(filename, contents, opts)
  }

  buildGaiaDocument() {
    return new GaiaDocument({
      id: this.shortHash,
      url: `${this.longHash}/${this.file.name}`,
      size: this.file.size,
      content_type: this.file.name.split('.').pop(),
      created_at: new Date().toISOString()
    });
  }
}

export default FileInputUploader;
