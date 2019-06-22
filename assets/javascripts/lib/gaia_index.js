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

  async load() {
    const indexJson = await privateUserSession.getFile('index');
    const index = JSON.parse(indexJson);

    if (index) {
      this.version = index.version || 1;
      this.documents = parseDocuments(index.files);
    } else {
      this.version = version;
      this.documents = [];
    }

    return this;
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

  async _syncFile(callback) {
    await this.load();
    callback(this);
    await privateUserSession.putFile('index', JSON.stringify(this));
    return this;
  }
}

export default GaiaIndex;
