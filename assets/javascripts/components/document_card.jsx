import React, { Component } from "react";
import ReactDOM from "react-dom";
import copy from 'copy-to-clipboard';
import Menu, {MenuList, MenuListItem, MenuListItemText, MenuListItemGraphic} from '@material/react-menu';
import MaterialIcon from '@material/react-material-icon';
import { Corner } from '@material/menu';
import Toast from '../lib/toast.jsx'

class DocumentCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { coordinates: undefined, open: false };
  }

  setAnchorElement = (element) => {
    if (this.state.anchorElement) {
      return;
    }
    this.setState({anchorElement: element});
  }

  handleCopyLinkClick = (evt) => {
    copy(this.props.doc.shareUrl());
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
      const that = this;
      this.props.doc.delete().then(() => {
        that.props.syncDocuments();
      });
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-us', { month: 'short' });
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${month} ${date.getDate()}, ${date.getHours()}:${minutes}`;
  }

  render() {
    const {doc, dummy} = this.props;
    return (
      <div className={`ev-document-card ${dummy && 'ev-document-card__dummy'}`}>
        <div className="ev-document-card__media">
          <img className="ev-document-card__media-image" src="/images/card-file.svg"/>
          {!dummy &&
              <a
                href=""
                onClick={this.handleKebabOpen}
                className="ev-document-card__media-kebab mdc-menu-surface--anchor"
                ref={this.setAnchorElement}
              />
          }
          <Menu
            anchorCorner={Corner.BOTTOM_START}
            anchorElement={this.state.anchorElement}
            open={this.state.open}
            onClose={this.handleKebabClose}
            onSelected={this.onDelete}
          >
            <MenuList>
              <MenuListItem>
                <MenuListItemGraphic graphic={<MaterialIcon icon="delete" />} />
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
            {!dummy && <a href={doc.shareUrl()} className="ev-document-card__open" target="_blank"></a>}
          </div>
        </div>
        <div className="ev-document-card__controls">
          <button
            className="ev-document-card__btn"
            onClick={this.handleCopyLinkClick}
            disabled={dummy}
          >
            {dummy ? 'uploading ...' : 'copy link'}
          </button>
        </div>
      </div>
    );
  }
}

export default DocumentCardComponent;
