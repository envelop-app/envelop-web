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
    this.state = { documents: [], dummyDoc: null };
    this.gaiaIndex = new GaiaIndex();
  }

  componentDidMount() {
    this.gaiaIndex.onChange(() => {
      this.setState({
        documents: sortDocuments(this.gaiaIndex.documents),
        dummyDoc: null // FIXME: dummydoc should not exist
      });
    });
    this.gaiaIndex.load();
  }

  handleInputChange = (evt) => {
    this
      .uploadFile(evt.target.files[0])
      .then(() => this.inputRef.current.value = null);
  }

  uploadFile(file) {
    const gaiaDocument = GaiaDocument.fromFile(file);
    this.setState({ dummyDoc: gaiaDocument });
    return this.gaiaIndex.addDocument(gaiaDocument);
  }

  onDocumentDelete = async (doc, callback) => {
    if (!window.confirm('Delete this file?')) { return; }
    this.gaiaIndex.deleteDocument(doc);
  }

  maybeRenderDummyDoc() {
    return this.state.dummyDoc &&
      <DocumentCardComponent
        uploading={!!this.state.dummyDoc}
        key={this.state.dummyDoc.created_at}
        doc={this.state.dummyDoc}
        onDelete={this.onDocumentDelete}
      />;
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent
        key={doc.created_at.getTime()}
        doc={doc}
        onDelete={this.onDocumentDelete}
      />;
    });
  }

  render() {
    return (
      <div>
        <div className="ev-upload-btn__wrapper">
          {/* <a href="" className="ev-upload-btn">UPLOAD</a> */}
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
          {this.maybeRenderDummyDoc()}
          {this.renderDocuments()}
        </div>
        <DropZoneComponent onDroppedFile={(file) => this.uploadFile(file)} />
      </div>
    );
  }
}

export default DocumentListComponent;
