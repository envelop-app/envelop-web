import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import DropZoneComponent from './drop_zone.jsx';
import GaiaDocument from '../lib/gaia_document';
import { gaiaIndex } from '../lib/gaia_index';
import Page from '../lib/page';

import ExtensionNavbarComponent from '../components/extension_navbar.jsx';
import ExtensionDocumentListComponent from '../components/extension_document_list.jsx';

class ExtensionAppComponent extends Component {
  constructor() {
    super();
    this.state = Object.assign(
      {},
      Dialogs.initState(),
      { documents: [], loading: true }
    );
  }

  componentDidMount() {
    Page.preventClose(async () => {
      gaiaIndex.onChange(() => {
        this.setState({ documents: gaiaIndex.documents });
      });

      await gaiaIndex.load();

      this.setState({ loading: false });

      return true;
    });
  }

  uploadFiles = async (files) => {
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


  showEmptyState() {
    return this.state.documents.length === 0;
  }

  render() {
    return [
      <ExtensionNavbarComponent key="navbar" uploadFiles={this.uploadFiles} />,
      <div key="container" className="ev-extension-app__container">
        {this.showEmptyState() ?
            <div className="ev-extension-app__empty-state">
              <img className="ev-extension-app__empty-state-image" src="/images/bg-empty-state.svg" />
              <div className="ev-extension-app__empty-state-text">
                Drag and drop<br/> to upload
              </div>
            </div>
            :
            <ExtensionDocumentListComponent
              documents={this.state.documents}
              uploadFiles={this.uploadFiles}
            />
        }
      </div>,
      <DropZoneComponent onDroppedFile={(files) => this.uploadFiles(files)} />
    ];
  }
}

export default ExtensionAppComponent;
