import { privateUserSession } from './blockstack_client';
import ProgressRegister from './progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class DocumentUploader {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
    this.reader = new FileReader();
    this.progress = new ProgressRegister(gaiaDocument.size);
  }

  upload() {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const rawFilePromise =  this.uploadRawFile(evt.target.result);
        const documentPromise = this.uploadDocument();

        Promise
          .all([rawFilePromise, documentPromise])
          .then(() => {
            this.progress.add(this.gaiaDocument.size);
            resolve(this.gaiaDocument);
          });
      }

      this.reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      this.reader.readAsArrayBuffer(this.gaiaDocument.file);
    });
  }

  onProgress(callback) {
    this.progress.onChange(callback);
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
