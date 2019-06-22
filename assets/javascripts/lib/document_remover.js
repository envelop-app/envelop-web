import { Random } from 'random-js'
import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';

class DocumentRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
  }

  async remove() {
    await this.removeRawFile();
    return this.removeDocument();
  }


  removeRawFile() {
    return privateUserSession.deleteFile(this.gaiaDocument.url);
  }

  removeDocument() {
    return privateUserSession.deleteFile(this.gaiaDocument.id);
  }
}

export default DocumentRemover;
