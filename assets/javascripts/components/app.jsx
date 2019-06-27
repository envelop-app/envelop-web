import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import GaiaDocument from '../lib/gaia_document';
import GaiaIndex from '../lib/gaia_index';
import LocalIndex from '../lib/local_index';

import DocumentListComponent from './document_list.jsx';
import DropZoneComponent from './drop_zone.jsx';
import MainDialogComponent from './main_dialog.jsx';

class AppComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.localIndex = new LocalIndex();
    this.gaiaIndex = new GaiaIndex();
    this.state = Object.assign({},
      Dialogs.initState(),
      { documents: [], deleting: null }
    );
  }

  async componentDidMount() {
    this.gaiaIndex.onChange(() => {
      this.setState({ documents: this.gaiaIndex.documents });
    });

    await this.localIndex.load();

    if (this.localIndex.tempDocuments.length > 0) {
      this.setState({ documents: this.localIndex.tempDocuments });
      this.gaiaIndex.addDocuments(this.localIndex.tempDocuments);
      this.localIndex.setTempDocuments([]);
    } else {
      this.gaiaIndex.load();
    }
  }

  handleInputChange = async (evt) => {
    await this.uploadFiles([...evt.target.files]);
    this.inputRef.current.value = null;
  }

  uploadFiles(files) {
    if (files.some(file => file.size > Constants.FILE_SIZE_LIMIT)) {
      Dialogs.open((state) => this.setState(state), Dialogs.MAXIMUM_FILE_SIZE);
      return;
    }

    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
    this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
    return this.gaiaIndex.addDocuments(gaiaDocuments);
  }

  onDocumentDelete = (doc, callback) => {
    Dialogs.open(
      (state) => this.setState(state),
      Dialogs.DELETE_CONFIRMATION,
      { onAccept: () => this.onConfirmDelete(doc) }
    );
  }

  onConfirmDelete = (doc) => {
    this.setState({ deleting: doc });
    this.gaiaIndex.deleteDocument(doc);
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
