import chunk from 'lodash/chunk';
import GaiaDocument from './gaia_document';
import Record from './records/record';
import sleep from './sleep';

const version = 1;

function parseDocuments(rawDocuments) {
  return (rawDocuments || []).map(raw => new GaiaDocument(raw));
}

class GaiaIndex {
  constructor() {
    this.version = null;
    this.documents = [];
    this.onChangeCallbacks = [];
    this.busy = false;
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
    const indexJson = await Record.getSession().getFile('index');
    const index = indexJson && JSON.parse(indexJson);

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

  attributes() {
    return { files: this.documents, version: this.version };
  }

  _setDocuments(documents) {
    this.documents = parseDocuments(documents);
    this.callOnChange();
  }

  toJSON() {
    return this.attributes();
  }

  async wait() {
    while (this.busy) {
      await sleep(50);
    }
  }

  async _syncFile(callback) {
    if (this.busy) {
      this.wait();
    }
    this.busy = true;

    await this.load();
    callback(this);
    await Record.getSession().putFile('index', JSON.stringify(this));

    this.busy = false;

    return this;
  }
}

export const gaiaIndex = new GaiaIndex();
