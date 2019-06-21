import GaiaDocument from './gaia_document';
import { privateUserSession } from './blockstack_client';

function parseDocuments(documents) {
  return (documents || []).map(doc => {
    return new GaiaDocument(doc);
  });
}

class GaiaIndex {
  load() {
    const that = this;
    return privateUserSession.getFile('index').then((indexJson) => {
      return that.documents = parseDocuments(JSON.parse(indexJson));
    });
  }

  addDocument(doc) {
    return this._syncFile((that) => {
      return that.documents.push(doc);
    });
  }

  removeDocument(doc) {
    return this._syncFile((that) => {
      return that.documents = that.documents.filter(d => d.id !== doc.id);
    });
  }

  serialize() {
    return this.documents;
  }

  toJSON() {
    return this.serialize();
  }

  _syncFile(callback) {
    return this.load()
      .then(() => callback(this))
      .then(() => privateUserSession.putFile('index', JSON.stringify(this)));
  }
}

export default GaiaIndex;
