import React, { Component } from "react";
import ReactDOM from "react-dom";
import { privateUserSession } from '../lib/blockstack_client';
import GaiaIndex from '../lib/gaia_index'
import DocumentCardComponent from "./document_card.jsx"
import FileInputUploader from '../lib/file_input_uploader'

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.gaiaIndex = new GaiaIndex();
    this.state = { documents: [] };
  }

  componentDidMount() {
    this.syncDocuments();
  }

  syncDocuments = () => {
    this.gaiaIndex.load().then(() => {
      this.setState({ documents: this.sortDocuments(this.gaiaIndex.documents) });
    });
  }

  sortDocuments(documents) {
    return documents.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at)
    });
  }

  onInputChange = (evt) => {
    new FileInputUploader(evt.target.files[0])
      .upload()
      .then(() => this.syncDocuments());
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
            className="ev-upload__input"
            id="file-upload"
            onChange={this.onInputChange}
            type="file"
            name="file-upload" />
        </div>
        <div className="ev-document-list">
          {this.renderDocuments()}
        </div>
      </div>
    );
  }
}

export default DocumentListComponent;
