import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import LinearProgress from '@material/react-linear-progress';

import GaiaDocument from '../lib/gaia_document'

const DocumentDownloadCardComponent = (props) =>{
  const doc = props.doc;

  return (
    <div className={"ev-document-card ev-document-card--download"}>
      <div className="ev-document-card__media ev-document-card__media--download">
        {doc && <img
          className="ev-document-card__media-image"
          src={`/images/${(doc && doc.getType()) || 'file'}.svg`}
        />}
      </div>
      {!doc && <LinearProgress indeterminate={true} />}
      <div className="ev-document-card__body ev-document-card__body--download">
        <div className={`ev-document-card__text-title ev-document-card__text-title--download ${!doc && 'ev-document-card__text-title--download-loading'}`}>
          {doc && doc.getName()}
        </div>
        <div className={`ev-document-card__text-primary ${!doc && 'ev-document-card__text-primary--download-loading'}`}>
          {doc && doc.getSizePretty()}
        </div>
      </div>
      <div className="ev-document-card__controls">
        <a href={doc && doc.url || '#'} className={`ev-document-card__btn--download ${!doc && 'ev-document-card__btn--download-loading'}`}>
          download
        </a>
      </div>
    </div>
  );
}

DocumentDownloadCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument),
};

export default DocumentDownloadCardComponent;
