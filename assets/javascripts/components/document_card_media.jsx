import React, { Component } from "react";
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'

class DocumentCardMediaComponent extends Component {
  constructor(props) {
    super(props);
  }

  renderContents() {
    const {doc, showProgress} = this.props;

    if (!doc) {
      return null;
    }
    else if (showProgress) {
      return this.renderProgressStatus();
    }
    else {
      return this.renderIconImg();
    }
  }

  renderProgressStatus() {
    const {action, doc, progress} = this.props;
    const downloadedBytes = Math.round(progress * doc.fileSize);

    return [
      <div key="1" className="ev-document-card__media-percentage">
        {Math.round(progress * 100)}%
      </div>,
      <div key="2" className="ev-document-card__media-bytes">
        {prettyBytes(downloadedBytes)} of {prettyBytes(doc.fileSize)} {action}ed
      </div>
    ];
  }

  renderIconImg() {
    return (
      <img
        className="ev-document-card__media-image"
        src={`/images/${this.props.doc.getType() || 'file'}.svg`}
      />
    );
  }

  render() {
    const {className, showProgress, progress} = this.props;

    return (
      <div className={`ev-document-card__media ${className} ${showProgress && 'ev-document-card__media--transferring'}`}>
        {this.renderContents()}
        {this.props.children}
        {showProgress &&
          <LinearProgress
            key="2"
            className="ev-document-card__media-linear-progress"
            progress={progress}
            buffer={1}/>}
      </div>
    );
  }
}

DocumentCardMediaComponent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  doc: PropTypes.instanceOf(GaiaDocument),
  showProgress: PropTypes.bool,
  progress: PropTypes.number,
  action: PropTypes.oneOf(['download', 'upload'])
};

export default DocumentCardMediaComponent;
