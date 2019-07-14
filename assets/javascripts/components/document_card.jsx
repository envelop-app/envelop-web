import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import Menu, {MenuList, MenuListItem, MenuListItemText, MenuListItemGraphic} from '@material/react-menu';
import MaterialIcon from '@material/react-material-icon';
import { Corner } from '@material/menu';

import Toast from '../lib/toast.jsx';
import GaiaDocument from '../lib/gaia_document';
import DocumentCardMediaComponent from './document_card_media.jsx';

class DocumentCardComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, progress: 0 };
  }

  componentDidMount() {
    this.props.doc.onUploadProgress((progress) => {
      this.setState({ progress });
    });
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

  onDelete = async () => {
    this.props.onDelete(this.props.doc);
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-us', { month: 'short' });
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${month} ${date.getDate()}, ${date.getHours()}:${minutes}`;
  }

  isDisabled() {
    return !this.props.doc.isPersisted() || this.props.deleting;
  }

  renderButtonText() {
    if (!this.props.doc.isPersisted()) {
      return 'uploading ...'
    }
    else if (this.props.deleting) {
      return 'deleting ...';
    }
    else {
      return 'copy link';
    }
  }

  renderMenu() {
    return [
      !this.isDisabled() &&
        <a
          key="1"
          href=""
          onClick={this.handleKebabOpen}
          className="ev-document-card__media-kebab mdc-menu-surface--anchor"
          ref={this.setAnchorElement}
        />,
        <Menu
          key="2"
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
    ];
  }

  render() {
    const {deleting, doc} = this.props;
    const progress = this.state.progress;

    return (
      <div className={`ev-document-card ${this.isDisabled() && 'ev-document-card__disabled'}`}>
        <DocumentCardMediaComponent
          doc={doc}
          action="upload"
          showProgress={!doc.isPersisted()}
          progress={progress}>
          {this.renderMenu()}
        </DocumentCardMediaComponent>
        <div className="ev-document-card__body">
          <div className="ev-document-card__body-left">
            <div className="ev-document-card__text-title">{doc.fileName}</div>
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
  deleting: PropTypes.bool,
  doc: PropTypes.instanceOf(GaiaDocument).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default DocumentCardComponent;
