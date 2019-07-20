import React, { Component } from "react";
import ReactDOM from "react-dom";

import Constants from '../lib/constants';
import GaiaDocument from '../lib/gaia_document';

import DocumentDownloadCardComponent from './document_download_card.jsx';

function parseUrl() {
  const paths = window.location.pathname.split('/').filter(s => s);

  if (paths.length !== 3) {
    throw(`Invalid download URL (path=${window.location.pathname}`)
  }

  const hashAndPasscode = paths[2].split('!');
  const hash = hashAndPasscode[0];
  const passcode = hashAndPasscode[1];

  return { hash, passcode, username: paths[1] };
}

class DownloadComponent extends Component {
  constructor() {
    super();
    this.state = { document: null };
  }

  fetchDocument() {
    const urlData = parseUrl();

    var username = urlData.username;
    if (!username.includes('.')) {
      username += '.id.blockstack';
    }

    // FIXME: salt must be in the file to facilitate this process
    const options = { username, passcode: urlData.passcode, salt: urlData.hash };
    GaiaDocument
      .get(urlData.hash, options)
      .then((gaiaDocument) => {
        this.setState({ document: gaiaDocument });
        window.document.title = `${gaiaDocument.name} - Envelop`;

        if (gaiaDocument.isUploading()) {
          setTimeout(() => this.fetchDocument(), Constants.DOWNLOAD_FILE_REFRESH);
        }
      });
    // TODO: .catch(() => /* do something when file doesn't exist */);
  }

  componentDidMount() {
    this.fetchDocument();
  }

  render() {
    const doc = this.state.document;

    return (
      <div className="ev-download__container">
        <div className="ev-download__card-wrapper">
          <DocumentDownloadCardComponent doc={doc} />
        </div>
        <div className="ev-download__text">
          Share private files easily, without losing their ownership.<br/>
          <a href="/">Try Envelop</a>
        </div>
        <img className="ev-download__image" src="/images/bg-empty-state.svg"/>
      </div>
    );
  }
}

export default DownloadComponent;
