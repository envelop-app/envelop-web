import React, { Component } from "react";
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";

import GaiaDocument from '../lib/gaia_document'
import Page from '../lib/page';

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
    link.click();
  }

  handleDownload() {
    Page.preventClose(() => {
      this.setState({ downloadState: 'downloading', progress: 0 });
      this.props.doc.onDownloadProgress((progress) => {
        this.setState({ progress });
      });

      return this.props.doc
        .download()
        .then((downloadUrl) => {
          setTimeout(() => this.triggerBrowserDownload(downloadUrl), 200);
          this.setState({ downloadState: 'downloaded' });
          return true;
        });
    });
  }

  isFetching() {
    return !this.props.doc;
  }

  isUploading() {
    const doc = this.props.doc;
    return doc && doc.isUploading();
  }

  isDownloading() {
    return this.state.downloadState === 'downloading';
  }

  isDownloaded() {
    return this.state.downloadState === 'downloaded';
  }

  isButtonDisabled() {
    return this.isFetching() || this.isUploading() || this.isDownloading();
  }

  renderButtonText() {
    if (this.isFetching()) {
      return '';
    }
    else if (this.isUploading()) {
      return 'waiting for upload';
    }
    else if (this.isDownloading()) {
      return 'downloading ...';
    }
    else if (this.isDownloaded()) {
      return 'download again';
    }
    else {
      return 'download';
    }
  }

  render() {
    const doc = this.props.doc;
    const { progress } = this.state;

    return (
      <div className="ev-document-card ev-document-card--download">
        <DocumentCardMediaComponent
          className="ev-document-card__media--download"
          doc={doc}
          action="download"
          showProgress={this.isDownloading() || this.isDownloaded()}
          progress={progress}
        />
        <div className="ev-document-card__body ev-document-card__body--download">
          <div className={`ev-document-card__text-title ev-document-card__text-title--download ${!doc && 'ev-document-card__text-title--download-loading'}`}>
            {doc && doc.getName()}
          </div>
          <div className={`ev-document-card__text-primary ${!doc && 'ev-document-card__text-primary--download-loading'}`}>
            {doc && doc.getSizePretty()}
          </div>
        </div>
        <div className="ev-document-card__controls">
          <button
            onClick={() => this.handleDownload()}
            disabled={this.isButtonDisabled()}
            className="ev-document-card__btn--download">
            {this.renderButtonText()}
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
