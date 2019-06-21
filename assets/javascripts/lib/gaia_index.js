import GaiaDocument from './gaia_document';
import { privateUserSession } from './blockstack_client';

const version = 1;

function parseDocuments(documents) {
  return (documents || []).map(doc => new GaiaDocument(doc));
}

class GaiaIndex {
  constructor() {
    this.version = null;
    this.documents = null;
  }

  load() {
    const that = this;
    return privateUserSession.getFile('index').then((indexJson) => {
      const index = JSON.parse(indexJson);

      if (index) {
        that.version = index.version || 1;
        that.documents = parseDocuments(index.files);
      } else {
        that.version = version;
        that.documents = [];
      }

      return true;
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
    return { files: this.documents, version: this.version };
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
