import React, { Component } from "react";
import ReactDOM from "react-dom";

import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';
import { privateUserSession } from '../lib/blockstack_client';

import DocumentCardComponent from './document_card.jsx';
import DropZoneComponent from './drop_zone.jsx';

function sortDocuments(documents) {
  return documents.sort(function(a, b) {
    return new Date(b.created_at) - new Date(a.created_at)
  });
}

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = { documents: [] };
    this.gaiaIndex = new GaiaIndex();
  }

  componentDidMount() {
    this.gaiaIndex.onChange(() => {
      this.setState({ documents: sortDocuments(this.gaiaIndex.documents) });
    });
    this.gaiaIndex.load();
  }

  handleInputChange = (evt) => {
    this
      .uploadFiles([...evt.target.files])
      .then(() => this.inputRef.current.value = null);
  }

  uploadFiles(files) {
    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
    this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
    return this.gaiaIndex.addDocuments(gaiaDocuments);
  }

  onDocumentDelete = async (doc, callback) => {
    if (!window.confirm('Delete this file?')) { return; }
    this.gaiaIndex.deleteDocument(doc);
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent
        key={`${doc.getName()}/${doc.created_at.getTime()}`}
        doc={doc}
        onDelete={this.onDocumentDelete}
      />;
    });
  }

  render() {
    return (
      <div>
        <div className="ev-upload-btn__wrapper">
          <label className="ev-upload__btn" htmlFor="file-upload">
            <img src="/images/baseline-cloud_upload-24px.svg" />
            <span>UPLOAD</span>
          </label>
          <input
            ref={this.inputRef}
            className="ev-upload__input"
            id="file-upload"
            onChange={this.handleInputChange}
            type="file"
            name="file-upload" />
        </div>
        <div className="ev-document-list">
          {this.renderDocuments()}
        </div>
        <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
      </div>
    );
  }
}

export default DocumentListComponent;
