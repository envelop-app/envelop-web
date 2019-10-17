import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import BackgroundDocumentRemover from '../lib/background_document_remover';
import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import GaiaDocument from '../lib/gaia_document';
import { gaiaIndex } from '../lib/gaia_index';
import LocalIndex from '../lib/local_index';
import Page from '../lib/page';

import DocumentListComponent from './document_list.jsx';
import DropZoneComponent from './drop_zone.jsx';
import MainDialogComponent from './main_dialog.jsx';

class AppComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.localIndex = new LocalIndex();
    this.state = Object.assign({},
      Dialogs.initState(),
      { documents: [], deleting: null, loading: true }
    );
  }

  componentDidMount() {
    BackgroundDocumentRemover.removeAll();

    Page.preventClose(async () => {
      gaiaIndex.onChange(() => {
        this.setState({ documents: gaiaIndex.documents });
      });

      await this.localIndex.load();

      if (this.localIndex.tempDocuments.length > 0) {
        this.setState({ documents: this.localIndex.tempDocuments });
        await gaiaIndex.addDocuments(this.localIndex.tempDocuments);
        this.localIndex.setTempDocuments([]);
      } else {
        await gaiaIndex.load();
      }

      this.setState({ loading: false });

      return true;
    });
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

    if (files.some(file => file.size === 0)) {
      Dialogs.open((state) => this.setState(state), Dialogs.EMPTY_FILE);
      return;
    }

    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));

    const allUploaded = gaiaDocuments.map(doc => {
      return new Promise(resolve => {
        doc.onUploaded(() => resolve());
      });
    });

    Page.preventClose(async () => {
      this.setState({ documents: [...gaiaDocuments, ...this.state.documents] });
      await gaiaIndex.addDocuments(gaiaDocuments);
      return Promise.all(allUploaded);
    });
  }

  onDocumentDelete = (doc, callback) => {
    Dialogs.open(
      (state) => this.setState(state),
      Dialogs.DELETE_CONFIRMATION,
      { onAccept: () => this.onConfirmDelete(doc) }
    );
  }

  onConfirmDelete = async (doc) => {
    this.setState({ deleting: doc });
    await doc.cancelUpload();
    await gaiaIndex.deleteDocument(doc);
  }

  showEmptyState() {
    return !this.state.loading && this.state.documents.length === 0;
  }

  renderUpload() {
    return (
      <div className="ev-upload__wrapper">
        {this.showEmptyState() && (
          <div className="ev-upload__arrow-wrapper">
            <div className="ev-upload__arrow-text">Start here</div>
            <img className="ev-upload__arrow-image" src="/images/arrow.svg" />
          </div>
        )}
        <div className="ev-upload__btn-wrapper">
          <label className="ev-upload__btn" htmlFor="file-upload">
            <MaterialIcon icon="add" />
            <span>UPLOAD</span>
          </label>
        </div>
        <input
          ref={this.inputRef}
          className="ev-upload__input"
          id="file-upload"
          onChange={this.handleInputChange}
          type="file"
          name="file-upload"
          multiple
        />
      </div>
    );
  }

  render() {
    return (
      <div className="ev-app__container">
        {this.renderUpload()}
        {this.showEmptyState() ?
            <div className="ev-app__empty-state">
              <img
                className="ev-app__empty-state-image"
                src="/images/bg-empty-state.svg"
                draggable={false}
              />
              <div className="ev-app__empty-state-text">
                Looking a little empty? Share your files, music, images, videos ...
              </div>
            </div>
            :
            <DocumentListComponent
              deleting={this.state.deleting}
              documents={this.state.documents}
              onDelete={this.onDocumentDelete}
            />
        }
        <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
        <MainDialogComponent {...this.state.dialog} />
      </div>
    );
  }
}

export default AppComponent;
