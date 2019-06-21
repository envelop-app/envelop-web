import React, { Component } from "react";
import ReactDOM from "react-dom";
import copy from 'copy-to-clipboard';
import Menu, {MenuList, MenuListItem, MenuListItemText} from '@material/react-menu';
import { Corner } from '@material/menu';
import { privateUserSession } from '../lib/blockstack_client'
import Toast from '../lib/toast.jsx'
import FileRemover from '../lib/file_remover'

class DocumentCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { coordinates: undefined, open: false };
  }

  shareUrl() {
    const username = privateUserSession.loadUserData().username;
    return `${window.location.origin}/d/${username}/${this.props.doc.id}`;
  }

  setAnchorElement = (element) => {
    if (this.state.anchorElement) {
      return;
    }
    this.setState({anchorElement: element});
  }

  handleCopyLinkClick = (evt) => {
    copy(this.shareUrl());
    Toast.open('Link copied to clipboard');
  }

  handleKebabOpen = (evt) => {
    evt.preventDefault();
    this.setState({open: true});
  }

  handleKebabClose = () => {
    this.setState({open: false});
  }

  onDelete = () => {
    if (window.confirm('Delete this file?')) {
      const documentRemover = new FileRemover(this.props.doc);
      documentRemover.remove().then(() => {
        window.location = window.location.href;
      });
    }
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
          <img className="ev-document-card__media-image" src="/images/card-file.svg"/>
          <a
            href=""
            onClick={this.handleKebabOpen}
            className="ev-document-card__media-kebab mdc-menu-surface--anchor"
            ref={this.setAnchorElement}
          />
          <Menu
            anchorCorner={Corner.BOTTOM_START}
            anchorElement={this.state.anchorElement}
            open={this.state.open}
            onClose={this.handleKebabClose}
            onSelected={this.onDelete}
          >
            <MenuList>
              <MenuListItem>
                <MenuListItemText primaryText={'Delete'} />
              </MenuListItem>
            </MenuList>
          </Menu>
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
          <button className="ev-document-card__btn" onClick={this.handleCopyLinkClick}>copy link</button>
        </div>
      </div>
    );
  }
}

export default DocumentCardComponent;
