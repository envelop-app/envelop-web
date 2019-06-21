import React, { Component } from "react";
import ReactDOM from "react-dom";
import { privateUserSession } from '../lib/blockstack_client';
import GaiaIndex from '../lib/gaia_index'
import DocumentCardComponent from "./document_card.jsx"
import FileInputUploader from '../lib/file_input_uploader'

class DocumentListComponent extends Component {
  constructor() {
    super();
    this.state = { documents: [] };
  }

  componentDidMount() {
    const gaiaIndex = new GaiaIndex();
    gaiaIndex.load().then(() => {
      this.setState({ documents: this.sortDocuments(gaiaIndex.documents) });
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
      .then(() => window.location = window.location.href);
  }

  renderDocuments() {
    return this.state.documents.map(doc => {
      return <DocumentCardComponent key={doc.id} doc={doc} />;
    });
  }

  render() {
    return (
      <div>
        <div className="ev-upload-btn__wrapper">
          {/* <a href="" className="ev-upload-btn">UPLOAD</a> */}
          <label className="ev-upload__btn" for="file-upload">UPLOAD</label>
          <input className="ev-upload__input" id="file-upload" onChange={this.onInputChange} type="file" name="file-upload" />
        </div>
        <div className="ev-document-list">
          {this.renderDocuments()}
        </div>
      </div>
    );
  }
}

export default DocumentListComponent;
