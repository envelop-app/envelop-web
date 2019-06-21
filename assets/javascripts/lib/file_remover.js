import { Random } from 'random-js'
import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';

class FileRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
  }

  remove() {
    return this.removeRawFile()
      .then(() => this.removeDocument())
      .then(() => this.updateIndex ());
  }


  removeRawFile() {
    return privateUserSession.deleteFile(this.gaiaDocument.url);
  }

  removeDocument() {
    return privateUserSession.deleteFile(this.gaiaDocument.id);
  }

  updateIndex() {
    return privateUserSession.getFile('index').then(index => {
      const gaiaIndex = new GaiaIndex(JSON.parse(index));
      gaiaIndex.removeDocument(this.gaiaDocument);
      return privateUserSession.putFile('index', JSON.stringify(gaiaIndex));
    });
  }
}

export default FileRemover;
