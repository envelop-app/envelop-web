import React, { Component } from "react";
import ReactDOM from "react-dom";
import { privateUserSession } from '../lib/blockstack_client';
import DocumentCardComponent from "./document_card.jsx"

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.state = { documents: [] };
  }

  componentDidMount() {
    privateUserSession.getFile('index').then(index => {
      const documents = index ? JSON.parse(index) : [];
      this.setState({ documents: this.sortDocuments(documents) });
    })
  }

  sortDocuments(documents) {
    return documents.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at)
    });
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent key={doc.id} {...doc} />;
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