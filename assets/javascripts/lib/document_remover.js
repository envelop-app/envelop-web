import { Random } from 'random-js'
import { privateUserSession } from './blockstack_client';
import GaiaDocument from './gaia_document';
import GaiaIndex from './gaia_index';

class DocumentRemover {
  constructor(gaiaDocument) {
    this.gaiaDocument = gaiaDocument;
  }

  async remove() {
    await this.removeRawFile();
    await this.removeDocument();
    return this.updateIndex();
  }


  removeRawFile() {
    return privateUserSession.deleteFile(this.gaiaDocument.url);
  }

  removeDocument() {
    return privateUserSession.deleteFile(this.gaiaDocument.id);
  }

  updateIndex() {
    const gaiaIndex = new GaiaIndex();
    return gaiaIndex.removeDocument(this.gaiaDocument);
  }
}

export default DocumentRemover;
