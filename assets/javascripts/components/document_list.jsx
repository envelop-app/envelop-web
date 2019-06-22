import React, { Component } from "react";
import ReactDOM from "react-dom";

import FileInputUploader from '../lib/file_input_uploader';
import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';
import { privateUserSession } from '../lib/blockstack_client';

import DocumentCardComponent from './document_card.jsx';
import DropZoneComponent from './drop_zone.jsx';

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = { documents: [], dummyDoc: null };
  }

  componentDidMount() {
    this.syncDocuments();
  }

  syncDocuments = async (options = {}) => {
    const gaiaIndex = new GaiaIndex();
    await gaiaIndex.load();

    const newState = {};
    newState.documents = this.sortDocuments(gaiaIndex.documents);
    if (options.removeDummyDoc) { newState.dummyDoc = null };
    this.setState(newState);
  }

  sortDocuments(documents) {
    return documents.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at)
    });
  }

  handleInputChange = (evt) => {
    this.uploadFile(evt.target.files[0]).then(() => this.inputRef.current.value = null);
  }

  async uploadFile(file) {
    this.setState({
      dummyDoc: new GaiaDocument({
        id: file.lastModified,
        url: `dummy/${file.name}`,
        created_at: file.lastModifiedDate,
        size: file.size,
        content_type: file.type
      })
    });
    await new FileInputUploader(file).upload();
    setTimeout(() => this.syncDocuments({ removeDummyDoc: true }), 100);
  }

  maybeRenderDummyDoc() {
    return this.state.dummyDoc &&
      <DocumentCardComponent
        uploading={!!this.state.dummyDoc}
        key={this.state.dummyDoc.id}
        doc={this.state.dummyDoc}
        syncDocuments={this.syncDocuments}
      />;
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent key={doc.id} doc={doc} syncDocuments={this.syncDocuments} />;
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
