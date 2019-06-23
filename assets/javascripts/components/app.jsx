import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';

import DocumentListComponent from './document_list.jsx';
import DropZoneComponent from './drop_zone.jsx';

class AppComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.gaiaIndex = new GaiaIndex();
    this.state = { documents: [] };
  }

  componentDidMount() {
    this.gaiaIndex.onChange(() => {
      this.setState({ documents: this.gaiaIndex.documents });
    });
    this.gaiaIndex.load();
  }

  handleInputChange = async (evt) => {
    await this.uploadFiles([...evt.target.files]);
    this.inputRef.current.value = null;
  }

  uploadFiles(files) {
    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
    this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
    return this.gaiaIndex.addDocuments(gaiaDocuments);
  }

  onDocumentDelete = (doc, callback) => {
    if (!window.confirm('Delete this file?')) { return; }
    return this.gaiaIndex.deleteDocument(doc);
  }

  render() {
    return (
      <div>
        <div className="ev-upload-btn__wrapper">
          <label className="ev-upload__btn" htmlFor="file-upload">
            <MaterialIcon icon="add" />
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
        <DocumentListComponent
          documents={this.state.documents}
          onDelete={this.onDocumentDelete}
        />
        <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
      </div>
    );
  }
}

export default AppComponent;
