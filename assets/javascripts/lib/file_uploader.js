import { Random } from 'random-js'
import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';

const publicFileOptions = { encrypt: false, verify: false };

class FileUploader {
  constructor(input) {
    this.input = input;
    this.reader = new FileReader();
    this.file = null;
    this.longHash = new Random().string(14);
    this.shortHash = new Random().string(6);
  }

  bind() {
    return new Promise((resolve, reject) => {
      this.input.onchange = (evt) => {
        const file = evt.target.files[0];
        this.file = file;
        this.reader.onload = (evt) => {
          resolve(this.uploadRawFile(evt.target.result).then(() => true));
        }
        this.reader.readAsArrayBuffer(this.file);
      }
    });
  }

  uploadRawFile(contents) {
    const filename = `${this.longHash}/${this.file.name}`;
    return this.putPublicFile(filename, contents)
      .then(() => this.uploadGaiaDocument());
  }

  uploadGaiaDocument() {
    const gaiaDocument = this.buildGaiaDocument();
    return this.putPublicFile(gaiaDocument.id, JSON.stringify(gaiaDocument))
      .then(() => this.updateIndex(gaiaDocument));
  }

  updateIndex(gaiaDocument) {
    return privateUserSession.getFile('index').then(index => {
      const gaiaIndex = new GaiaIndex(JSON.parse(index));
      gaiaIndex.addDocument(gaiaDocument);
      return privateUserSession.putFile('index', JSON.stringify(gaiaIndex));
    });
  }

  putPublicFile(filename, contents) {
    return privateUserSession.putFile(filename, contents, publicFileOptions)
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

export default FileUploader;
