import React, { Component } from "react";
import ReactDOM from "react-dom";
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import MaterialIcon from '@material/react-material-icon';

import Toast from '../lib/toast.jsx';
import GaiaDocument from '../lib/gaia_document';

class ExtensionDocumentCardComponent extends Component {
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

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-us', { month: 'short' });
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${month} ${date.getDate()}, ${date.getHours()}:${minutes}`;
  }

  renderRight() {
    if (this.props.doc.isReady()) {
      return (
        <div className="ev-extension-document-card__right">
          <button className="ev-extension-document-card__copy-btn" onClick={this.handleCopyLinkClick}>
            copy link
          </button>
        </div>
      );
    }
    else {
      const progress = Math.round(this.state.progress * 100);

      return (
        <span className="ev-text-medium">Uploading {progress}%</span>
      );
    }
  }

  render() { const {deleting, doc} = this.props;
    return (
      <div className={'ev-extension-document-card'}>
        <div className="ev-extension-document-card__left">
          <div className="ev-extension-document-card__text-primary" title={doc.name}>{doc.name}</div>
          <div className="ev-extension-document-card__text-secondary">
            {prettyBytes(doc.size)} · {this.formatDate(doc.created_at)}
          </div>
        </div>
        {this.renderRight()}
      </div>
    );
  }
}

ExtensionDocumentCardComponent.propTypes = {
  doc: PropTypes.instanceOf(GaiaDocument).isRequired
};

export default ExtensionDocumentCardComponent;
