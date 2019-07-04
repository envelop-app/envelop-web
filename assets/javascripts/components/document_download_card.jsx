import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'

class DocumentDownloadCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { downloadUrl: null };
  }

  isReady() {
    return this.props.doc && this.state.downloadUrl;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.downloadUrl || !nextProps.doc) { return; }

    const downloadUrl = nextProps.doc
      .download()
      .then((downloadUrl) => this.setState({ downloadUrl }));
  }

  render() {
    const doc = this.props.doc;
    const ready = this.isReady();

    return (
      <div className={"ev-document-card ev-document-card--download"}>
        <div className="ev-document-card__media ev-document-card__media--download">
          {ready && <img
          className="ev-document-card__media-image"
          src={`/images/${(ready && doc.getType()) || 'file'}.svg`}
        />}
      </div>
      {!ready && <LinearProgress indeterminate={true} />}
      <div className="ev-document-card__body ev-document-card__body--download">
        <div className={`ev-document-card__text-title ev-document-card__text-title--download ${!ready && 'ev-document-card__text-title--download-loading'}`}>
          {ready && doc.getName()}
        </div>
        <div className={`ev-document-card__text-primary ${!ready && 'ev-document-card__text-primary--download-loading'}`}>
          {ready && doc.getSizePretty()}
        </div>
      </div>
      <div className="ev-document-card__controls">
        <a
          href={ready && this.state.downloadUrl || '#'}
          className={`ev-document-card__btn--download ${!ready && 'ev-document-card__btn--download-loading'}`}
          download={ready && doc.getName()}>
          download
        </a>
      </div>
    </div>
    );
  }
}

DocumentDownloadCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument),
};

export default DocumentDownloadCardComponent;
