import GaiaDocument from './gaia_document';

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
  }

  removeDocument(doc) {
    this.documents = this.documents.filter(d => d.id !== doc.id);
  }

  serialize() {
    return this.documents;
  }

  toJSON() {
    return this.serialize();
  }
}

export default GaiaIndex;
