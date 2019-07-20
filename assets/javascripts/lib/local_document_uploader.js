import LocalDatabase from '../lib/local_database';
import Constants from '../lib/constants';
import ProgressRegister from '../lib/progress_register';

class LocalDocumentUploader {
  constructor(doc) {
    this.doc = doc;
    this.reader = new FileReader();
    this.progress = new ProgressRegister(doc.size);
  }

  async upload(file) {
    new Promise((resolve) => {
      this.reader.onload = (evt) => {
        const payload = Object.assign({}, this.doc, {
          localContents: evt.target.result
        });
        const documentKey = `${Constants.TEMP_DOCUMENTS_PREFIX}/${payload.id}`;

        LocalDatabase
          .setItem(documentKey, payload)
          .then(() =>{
            this.progress.add(this.doc.size);
            resolve(this.doc);
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
