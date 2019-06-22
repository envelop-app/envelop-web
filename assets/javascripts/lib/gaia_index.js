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
    this.onChangeCallbacks = [];
  }

  async addDocument(doc) {
    await doc.save();
    await this._syncFile(that => that.setDocuments([...that.documents, doc]));
    return this;
  }

  callOnChange() {
    this.onChangeCallbacks.forEach((callback) => callback());
  }

  async deleteDocument(doc) {
    await doc.delete();
    await this._syncFile(that => {
      that.setDocuments(that.documents.filter(d => d.id !== doc.id));
    });
    return this;
  }

  async load() {
    const indexJson = await privateUserSession.getFile('index');
    const index = JSON.parse(indexJson);

    if (index) {
      this.version = index.version || 1;
      this.setDocuments(index.files);
    } else {
      this.version = version;
      this.setDocuments([]);
    }

    return this;
  }

  onChange(callback) {
    if (typeof callback !== 'function') {
      throw(`Callback must be a function. Received ${typeof callback}`);
    }
    this.onChangeCallbacks.push(callback);
  }

  serialize() {
    return { files: this.documents, version: this.version };
  }

  setDocuments(documents) {
    this.documents = parseDocuments(documents);
    this.callOnChange();
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
