import LocalDatabase from '../lib/local_database';
import Constants from '../lib/constants';
import GaiaDocument from './gaia_document';

class LocalDocumentUploader {
  constructor(serializedDocument) {
    this.serializedDocument = serializedDocument;
    this.reader = new FileReader();
  }

  async upload() {
    new Promise((resolve, reject) => {
      this.reader.onload = (evt) => {
        const payload = Object.assign({}, this.serializedDocument, {
          localContents: evt.target.result
        });
        const documentKey = `${Constants.TEMP_DOCUMENTS_PREFIX}/${payload.id}`;

        LocalDatabase
          .setItem(documentKey, payload)
          .then(() => resolve(this.serializedDocument)) ;
      }
      this.reader.readAsArrayBuffer(this.serializedDocument.file);
    });
  }
}

export default LocalDocumentUploader;
