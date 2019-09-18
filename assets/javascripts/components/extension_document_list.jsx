import PropTypes from 'prop-types';
import React, { Component } from "react";
import ReactDOM from "react-dom";

import GaiaDocument from '../lib/gaia_document';

import ExtensionDocumentCardComponent from './extension_document_card.jsx';

function sortDocuments(documents) {
  return documents.sort(function(a, b) {
    return new Date(b.created_at) - new Date(a.created_at)
  });
}

function filterDocuments(documents) {
  return documents.filter(doc => doc.deleted !== true);
}

function ExtensionDocumentListComponent(props) {
  return (
    <div className="ev-extension-document-list">
      {sortDocuments(filterDocuments(props.documents)).map(doc => (
        <ExtensionDocumentCardComponent key={doc.uniqueKey()} doc={doc} />
      ))}
    </div>
  );
}

ExtensionDocumentListComponent.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.instanceOf(GaiaDocument)).isRequired
};

export default ExtensionDocumentListComponent;
