import GaiaDocument from './gaia_document';
import { privateUserSession } from './blockstack_client';

function parseDocuments(documents) {
  return documents.map(doc => {
    return new GaiaDocument(doc);
  });
}

class GaiaIndex {
  constructor(documents) {
    this.documents = parseDocuments(documents || []);
  }

  addDocument(doc) {
    this.documents.push(doc);
    return this._syncFile();
  }

  removeDocument(doc) {
    this.documents = this.documents.filter(d => d.id !== doc.id);
    return this._syncFile();
  }

  serialize() {
    return this.documents;
  }

  toJSON() {
    return this.serialize();
  }

  _syncFile(contents) {
    return privateUserSession.putFile('index', JSON.stringify(this));
  }
}

export default GaiaIndex;
