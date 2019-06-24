import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Constants from '../lib/constants';
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
    this.state = { documents: [], deleting: null, dialog: {} };
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
    if (files.some(file => file.size > Constants.FILE_SIZE_LIMIT)) {
      this.maximumFileSizeDialog('open');
      return;
    }

    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
    this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
    return this.gaiaIndex.addDocuments(gaiaDocuments);
  }

  onDocumentDelete = (doc, callback) => {
    this.deleteConfirmationDialog('open', doc)
  }

  onConfirmDelete = (doc) => {
    this.setState({ deleting: doc });
    this.gaiaIndex.deleteDocument(doc);
  }

  dialog(status, dialogState = {}) {
    if (status === 'open') {
      const openState = Object.assign(
        dialogState,
        { open: true, onClose: (() => this.dialog('close'))}
      );
      this.setState({ dialog: openState });
    }
    else if (status === 'close') {
      this.setState({ dialog: {} });
    }
    else {
      throw("Missing argument 'status'")
    }
  }

  deleteConfirmationDialog(status, doc) {
    const dialogState = {
      acceptText: 'Delete',
      content: <p>Delete this file?</p>,
      dismissText: 'Cancel',
      onAccept: () => this.onConfirmDelete(doc)
    }
    this.dialog('open', dialogState);
  }

  maximumFileSizeDialog(status) {
    const dialogState = {
      title: 'File size over limit',
      acceptText: 'Ok, got it',
      content: <p>File size limit is <strong>25Mb</strong>, try again with a smaller file.</p>
    }
    this.dialog('open', dialogState);
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
        <MainDialogComponent {...this.state.dialog} />
      </div>
    );
  }
}

export default AppComponent;
