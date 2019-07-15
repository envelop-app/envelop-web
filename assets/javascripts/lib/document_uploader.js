import { privateUserSession } from './blockstack_client';
import ProgressRegister from './progress_register';

const publicFileOptions = { encrypt: false, verify: false };
function putPublicFile(name, contents) {
  return privateUserSession.putFile(name, contents, publicFileOptions);
}

class DocumentUploader {
  constructor(serializedDocument) {
    this.serializedDocument = serializedDocument;
    this.reader = new FileReader();
    this.progress = new ProgressRegister(serializedDocument.fileSize);
  }

  upload(file) {
    return new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const rawFilePromise = this.uploadRawFile(evt.target.result);
        rawFilePromise
          .then(() => {
            this.progress.add(this.serializedDocument.fileSize);
            resolve(this.serializedDocument);
          });
      }

      this.reader.onerror = (evt) => {
        reject(evt.target.error);
      }

      this.reader.readAsArrayBuffer(file);
    });
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }

  uploadRawFile(contents) {
    const options = { contentType: 'application/octet-stream' };
    return putPublicFile(this.serializedDocument.filePath, contents, options);
  }
}

export default DocumentUploader;
