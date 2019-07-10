import React, { Component } from "react";
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'

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

  renderCardMedia() {
    const doc = this.props.doc;
    const downloadState = this.state.downloadState;

    if (!doc) { return null; }

    if (downloadState === 'downloading' || downloadState === 'downloaded') {
      const downloadedBytes = Math.round(this.state.progress * doc.size);

      return [
        <div key="1" className="ev-document-card__media-percentage">
          {this.state.progress * 100}%
        </div>,
        <div key="2" className="ev-document-card__media-bytes">
          {prettyBytes(downloadedBytes)} of {prettyBytes(doc.size)} downloaded
        </div>
      ];
    }
    else {
      return (
        <img
          className="ev-document-card__media-image"
          src={`/images/${doc.getType() || 'file'}.svg`}
        />
      );
    }
  }

  render() {
    const doc = this.props.doc;
    const { downloadState, progress } = this.state;
    const downloading = downloadState === 'downloading';
    const downloaded = downloadState === 'downloaded';
    const ready = this.isDocReady();

    return (
      <div className={"ev-document-card ev-document-card--download"}>
        <div className="ev-document-card__media ev-document-card__media--download">
          {this.renderCardMedia()}
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
