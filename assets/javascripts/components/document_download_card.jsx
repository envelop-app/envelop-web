import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

import GaiaDocument from '../lib/gaia_document'

const DocumentDownloadCardComponent = (props) =>{
  const doc = props.doc;

  return (
    <div className={"ev-document-card ev-document-card--download"}>
      <div className="ev-document-card__media ev-document-card__media--download">
        <img
          className="ev-document-card__media-image"
          src={`/images/${doc.getType()}.svg`}
        />
      </div>
      <div className="ev-document-card__body ev-document-card__body--download">
        <div className="ev-document-card__text-title ev-document-card__text-title--download">
          {doc.getName()}
        </div>
        <div className="ev-document-card__text-primary">{doc.getSizePretty()}</div>
      </div>
      <div className="ev-document-card__controls">
        <a href={doc.url} className="ev-document-card__btn--download">
          download
        </a>
      </div>
    </div>
  );
}

DocumentDownloadCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument).isRequired,
};

export default DocumentDownloadCardComponent;
