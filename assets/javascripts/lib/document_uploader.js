import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class DocumentUploader {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.reader = new FileReader();
  }

  upload() {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const rawFilePromise =  this.uploadRawFile(evt.target.result);
        const documentPromise = this.uploadDocument();

        Promise
          .all([rawFilePromise, documentPromise])
          .then(() => resolve(this.gaiaDocument));
      }

      this.reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      this.reader.readAsArrayBuffer(this.gaiaDocument.file);
    });
  }

  uploadRawFile(contents) {
    const options = { contentType: 'application/octet-stream' };
    return putPublicFile(this.gaiaDocument.url, contents, options);
  }

  uploadDocument() {
    const contents = JSON.stringify(this.gaiaDocument)
    return putPublicFile(this.gaiaDocument.id, contents);
  }
}

export default DocumentUploader;
