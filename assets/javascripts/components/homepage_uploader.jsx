import React, { Component } from "react";
import ReactDOM from "react-dom";

import Constants from '../lib/constants';
import Dialogs from '../lib/dialogs';
import GaiaDocument from '../lib/gaia_document';
import LocalIndex from '../lib/local_index';
import { authenticate, privateUserSession } from '../lib/blockstack_client';

import DropZoneComponent from './drop_zone.jsx';
import MainDialogComponent from './main_dialog.jsx';

class HomepageUploaderComponent extends Component {
  constructor() {
    super();
    this.state = Object.assign({}, Dialogs.initState);
    this.localIndex = new LocalIndex();
  }

  componentDidMount() {
    this.localIndex.setTempDocuments([]);
  }

  async storeLocalFiles(files) {
    if (files.some(file => file.size > Constants.FILE_SIZE_LIMIT)) {
      Dialogs.open((state) => this.setState(state), Dialogs.MAXIMUM_FILE_SIZE)
      return;
    }

    if (files.some(file => file.size === 0)) {
      Dialogs.open((state) => this.setState(state), Dialogs.EMPTY_FILE)
      return;
    }

    const gaiaDocuments = files.map(file => GaiaDocument.fromFile(file));
    await this.localIndex.setTempDocuments(gaiaDocuments)

    this.redirectToApp();
  }

  redirectToApp() {
    if (privateUserSession.isUserSignedIn()) {
      window.location = Constants.BLOCKSTACK_REDIRECT_URI;
    }
    else {
      authenticate();
    }
  }

  render() {
    return (
      <div>
        <DropZoneComponent onDroppedFile={(files) => this.storeLocalFiles(files)} />
        <MainDialogComponent {...this.state.dialog} />
      </div>
    );
  }
}

export default HomepageUploaderComponent;
