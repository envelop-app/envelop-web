import React, { Component } from "react";
import ReactDOM from "react-dom";
import copy from 'copy-to-clipboard';
import { privateUserSession } from '../lib/blockstack_client'
import Toast from '../lib/toast.jsx'

class DocumentCardComponent extends Component {
  shareUrl() {
    const username = privateUserSession.loadUserData().username;
    return `${window.location.origin}/d/${username}/${this.props.doc.id}`;
  }

  handleCopyLinkClick(evt) {
    copy(this.shareUrl());
    Toast.open('Link copied to clipboard');
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-us', { month: 'short' });
    return `${month} ${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  }

  render() {
    const doc = this.props.doc;
    return (
      <div className="ev-document-card">
        <div className="ev-document-card__media">
          <img src="/images/card-file.svg"/>
        </div>
        <div className="ev-document-card__body">
          <div className="ev-document-card__body-left">
            <div className="ev-document-card__text-title">{doc.getName()}</div>
            <div className="ev-document-card__text-primary">{doc.getSizePretty()}</div>
            <div className="ev-document-card__text-secondary">{this.formatDate(doc.created_at)}</div>
          </div>
          <div className="ev-document-card__body-right">
            <a href={this.shareUrl()} className="ev-document-card__open" target="_blank"></a>
          </div>
        </div>
        <div className="ev-document-card__controls">
          <button className="ev-document-card__btn" onClick={(evt) => this.handleCopyLinkClick(evt)}>copy link</button>
        </div>
      </div>
    );
  }
}

export default DocumentCardComponent;
