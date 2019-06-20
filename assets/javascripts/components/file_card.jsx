import React, { Component } from "react";
import ReactDOM from "react-dom";
import copy from 'copy-to-clipboard';
import { privateUserSession } from '../lib/blockstack_client'
import Toast from '../lib/toast.jsx'
import prettyBytes from 'pretty-bytes';

class FileCardComponent extends Component {
  shareUrl() {
    const username = privateUserSession.loadUserData().username;
    return `${window.location.origin}/d/${username}/${this.props.id}`;
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

  formatSize(size) {
    return prettyBytes(size);
  }

  render() {
    const { url, size, created_at } = this.props;
    const name = url.split('/').pop();
    return (
      <div className="ev-file-card">
        <div className="ev-file-card__media">
          <img src=""/>
        </div>
        <div className="ev-file-card__body">
          <div className="ev-file-card__body-left">
            <div className="ev-file-card__text-title">{name}</div>
            <div className="ev-file-card__text-primary">{this.formatSize(size)}</div>
            <div className="ev-file-card__text-secondary">{this.formatDate(created_at)}</div>
          </div>
          <div className="ev-file-card__body-right">
            <a href={this.shareUrl()} className="ev-file-card__open" target="_blank"></a>
          </div>
        </div>
        <div className="ev-file-card__controls">
          <button className="ev-file-card__btn" onClick={(evt) => this.handleCopyLinkClick(evt)}>copy link</button>
        </div>
      </div>
    );
  }
}

export default FileCardComponent;
