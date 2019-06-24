import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';

import DocumentListComponent from './document_list.jsx';
import DropZoneComponent from './drop_zone.jsx';
import MainDialogComponent from './main_dialog.jsx';

class AppComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.gaiaIndex = new GaiaIndex();
    this.state = { documents: [], toDelete: null, deleting: null };
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
    this.setState({ toDelete: doc });
  }

  onConfirmDelete = (doc) => {
    this.gaiaIndex.deleteDocument(doc);
    this.setState({ deleting: doc, toDelete: null });
  }

  onCancelDelete = (doc) => {
    this.setState({ toDelete: null });
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
          deleting={this.state.deleting}
          documents={this.state.documents}
          onDelete={this.onDocumentDelete}
        />
        <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
        <MainDialogComponent
          acceptText={'Delete'}
          body={'Delete this file?'}
          dismissText={'Cancel'}
          onAccept={() => this.onConfirmDelete(this.state.toDelete)}
          onDismiss={() => this.onCancelDelete(this.state.toDelete)}
          open={!!this.state.toDelete}
        />
      </div>
    );
  }
}

export default AppComponent;
