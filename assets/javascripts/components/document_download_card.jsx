import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'
import DocumentCardMediaComponent from './document_card_media.jsx'

class DocumentDownloadCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { downloadState: null, progress: 0 };
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
    this.setState({ downloadState: 'downloading', progress: 0 });
    this.props.doc.onDownloadProgress((progress) => {
      this.setState({ progress });
    });

    this.props.doc
      .download()
      .then((downloadUrl) => {
        this.triggerBrowserDownload(downloadUrl);
        this.setState({ downloadState: 'downloaded' });
      });
  }

  render() {
    const doc = this.props.doc;
    const { downloadState, progress } = this.state;
    const downloading = downloadState === 'downloading';
    const downloaded = downloadState === 'downloaded';
    const ready = this.isDocReady();

    return (
      <div className="ev-document-card ev-document-card--download">
        <DocumentCardMediaComponent
          className="ev-document-card__media--download"
          doc={doc}
          action="download"
          showProgress={downloading || downloaded}
          progress={progress}
        />
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
            {downloading ? 'downloading ...' : (downloaded ? 'download again' : 'download')}
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
