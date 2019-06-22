import GaiaDocument from './gaia_document';
import { privateUserSession } from './blockstack_client';

const version = 1;

function parseDocuments(rawDocuments) {
  return (rawDocuments || []).map(raw => GaiaDocument.fromGaia(raw));
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

  async addDocument(doc) {
    await doc.save();
    await this._syncFile(that => that.documents.push(doc));
    return this;
  }

  async deleteDocument(doc) {
    await doc.delete();
    await this._syncFile(that => {
      that.documents = that.documents.filter(d => d.id !== doc.id);
    });
    return this;
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
