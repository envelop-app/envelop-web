import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import Menu, {MenuList, MenuListItem, MenuListItemText, MenuListItemGraphic} from '@material/react-menu';
import MaterialIcon from '@material/react-material-icon';
import { Corner } from '@material/menu';
import Toast from '../lib/toast.jsx'
import GaiaDocument from '../lib/gaia_document'

class DocumentCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { coordinates: undefined, open: false, deleting: false };
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
    this.setState({ deleting: true });
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

  isDisabled() {
    return this.props.uploading || this.state.deleting;
  }

  renderButtonText() {
    if (this.props.uploading) {
      return 'uploading ...'
    }
    else if (this.props.deleting) {
      return 'deleting ...';
    }
    else {
      return 'copy link';
    }
  }

  render() {
    const {doc, uploading} = this.props;
    const deleting = this.state.deleting;

    return (
      <div className={`ev-document-card ${this.isDisabled() && 'ev-document-card__disabled'}`}>
        <div className="ev-document-card__media">
          <img className="ev-document-card__media-image" src="/images/card-file.svg"/>
          {!this.isDisabled() &&
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
            {!this.isDisabled() && <a href={doc.shareUrl()} className="ev-document-card__open" target="_blank"></a>}
          </div>
        </div>
        <div className="ev-document-card__controls">
          <button
            className="ev-document-card__btn"
            onClick={this.handleCopyLinkClick}
            disabled={this.isDisabled()}
          >
            {this.renderButtonText()}
          </button>
        </div>
      </div>
    );
  }
}

DocumentCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument).isRequired,
  uploading: PropTypes.bool
};

export default DocumentCardComponent;
