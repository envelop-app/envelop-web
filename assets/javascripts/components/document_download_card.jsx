import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'

class DocumentDownloadCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { downloading: false, progress: 0 };
  }

  isDocReady() {
    return this.props.doc;
  }

  triggerBrowserDownload(url) {
    const link = document.createElement('a')
    link.href = url;
    link.download = this.props.doc.getName();
    link.click()
  }

  handleDownload() {
    this.setState({ downloading: true });

    this.props.doc.onDownloadProgress((progress) => {
      this.setState({ progress });
    });

    this.props.doc
      .download()
      .then((downloadUrl) => {
        this.triggerBrowserDownload(downloadUrl);
        this.setState({ downloading: false });
      });
  }

  render() {
    const doc = this.props.doc;
    const { downloading, progress } = this.state;
    const ready = this.isDocReady();

    return (
      <div className={"ev-document-card ev-document-card--download"}>
        <div className="ev-document-card__media ev-document-card__media--download">
          {ready && <img
          className="ev-document-card__media-image"
          src={`/images/${(ready && doc.getType()) || 'file'}.svg`}
        />}
      </div>
      {downloading && <LinearProgress progress={progress} buffer={1} />}
      <div className="ev-document-card__body ev-document-card__body--download">
        <div className={`ev-document-card__text-title ev-document-card__text-title--download ${!ready && 'ev-document-card__text-title--download-loading'}`}>
          {ready && doc.getName()}
        </div>
        <div className={`ev-document-card__text-primary ${!ready && 'ev-document-card__text-primary--download-loading'}`}>
          {ready && doc.getSizePretty()}
        </div>
      </div>
      <div className="ev-document-card__controls">
        <button
          onClick={() => this.handleDownload()}
          className={`ev-document-card__btn--download ${(!ready || downloading) && 'ev-document-card__btn--download-loading'}`}>
          download
        </button>
      </div>
    </div>
    );
  }
}

DocumentDownloadCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument),
};

export default DocumentDownloadCardComponent;
