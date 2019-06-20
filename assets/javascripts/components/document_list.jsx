import React, { Component } from "react";
import ReactDOM from "react-dom";
import { privateUserSession } from '../lib/blockstack_client';
import GaiaIndex from '../lib/gaia_index'
import DocumentCardComponent from "./document_card.jsx"

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.state = { documents: [] };
  }

  componentDidMount() {
    privateUserSession.getFile('index').then(index => {
      const gaiaIndex = new GaiaIndex(JSON.parse(index));
      this.setState({ documents: this.sortDocuments(gaiaIndex.documents) });
    })
  }

  sortDocuments(documents) {
    return documents.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at)
    });
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent key={doc.id} doc={doc} />;
    });
  }

  render() {
    return (
      <div className="ev-document-list">
        {this.renderDocuments()}
      </div>
    );
  }
}

export default DocumentListComponent;
