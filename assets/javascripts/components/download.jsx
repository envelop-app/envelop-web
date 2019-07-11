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
  return { hash: paths[2], username: paths[1] };
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

    GaiaDocument
      .get(username, urlData.hash)
      .then((gaiaDocument) => {
        this.setState({ document: gaiaDocument });
        window.document.title = `${gaiaDocument.getName()} - Envelop`;

        if (gaiaDocument.uploaded === false) {
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
