import { chunk } from 'lodash';
import GaiaDocument from './gaia_document';
import { privateUserSession } from './blockstack_client';

const version = 1;

function parseDocuments(rawDocuments) {
  return (rawDocuments || []).map(raw => new GaiaDocument(raw));
}

class GaiaIndex {
  constructor() {
    this.version = null;
    this.documents = [];
    this.onChangeCallbacks = [];
  }

  async addDocuments(docs) {
    // Upload files at a time and update index in the end
    const groups = chunk(docs, 5);

    for (const group of groups) {
      await Promise.all(group.map(doc => doc.save()));
    }

    await this._syncFile(that => {
      that._setDocuments([...that.documents, ...docs])
    });
    return this;
  }

  callOnChange() {
    this.onChangeCallbacks.forEach((callback) => callback());
  }

  async deleteDocument(doc) {
    await doc.delete();
    await this._syncFile(that => {
      that._setDocuments(that.documents.filter(d => d.id !== doc.id));
    });
    return this;
  }

  async load() {
    const indexJson = await privateUserSession.getFile('index');
    const index = JSON.parse(indexJson);

    if (index) {
      this.version = index.version || 1;
      this._setDocuments(index.files);
    } else {
      this.version = version;
      this._setDocuments([]);
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

  _setDocuments(documents) {
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
