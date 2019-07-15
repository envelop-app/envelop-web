import LocalDatabase from '../lib/local_database';
import Constants from '../lib/constants';
import ProgressRegister from '../lib/progress_register';

class LocalDocumentUploader {
  constructor(serializedDocument) {
    this.serializedDocument = serializedDocument;
    this.reader = new FileReader();
    this.progress = new ProgressRegister(serializedDocument.fileSize);
  }

  async upload(file) {
    new Promise((resolve) => {
      this.reader.onload = (evt) => {
        const payload = Object.assign({}, this.serializedDocument, {
          localContents: evt.target.result
        });
        const documentKey = `${Constants.TEMP_DOCUMENTS_PREFIX}/${payload.id}`;

        LocalDatabase
          .setItem(documentKey, payload)
          .then(() =>{
            this.progress.add(this.serializedDocument.fileSize);
            resolve(this.serializedDocument);
          }) ;
      }
      this.reader.readAsArrayBuffer(file);
    });
  }

  onProgress(callback) {
    this.progress.onChange(callback);
  }
}

export default LocalDocumentUploader;
