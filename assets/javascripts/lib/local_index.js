import LocalDatabase from '../lib/local_database';
import Constants from '../lib/constants';
import GaiaDocument from '../lib/gaia_document';

const indexKey = `${Constants.TEMP_DOCUMENTS_PREFIX}/index`;

function parseDocuments(rawDocuments) {
  return (rawDocuments || []).map(raw => GaiaDocument.fromLocal(raw));
}

class LocalIndex {
  constructor() {
    this.tempDocuments = [];
  }

  async load() {
    const index = await LocalDatabase.getItem(indexKey);
    if (index) {
      this.tempDocuments = parseDocuments(index.tempDocuments);
    }
    else {
      this.tempDocuments = parseDocuments([]);
    }
  }

  async setTempDocuments(docs) {
    this.tempDocuments = docs;
    await Promise.all(docs.map(doc => doc.saveLocal()));
    await this._dump();
    return this;
  }

  serialize() {
    return { tempDocuments: this.tempDocuments };
  }

  _dump() {
    return LocalDatabase.setItem(indexKey, this.serialize())
  }
}

export default LocalIndex;
