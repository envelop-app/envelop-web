import React, { Component } from "react";
import ReactDOM from "react-dom";
import { detect as detectBrowser } from 'detect-browser';
import LocalDatabase from '../lib/local_database';

const extensionUrls = {
  chrome: 'https://chrome.google.com/webstore/detail/envelop/fedfongpkeoiknldijklbhhmiomelogi',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/envelop/',
  opera: 'https://addons.opera.com/extensions/details/envelop/'
}

function getExtensionUrl() {
  const url = extensionUrls[detectBrowser().name];
  return url || extensionUrls.chrome;
}

class BannerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false, extensionUrl: getExtensionUrl() };
  }

  componentDidMount() {
    LocalDatabase
      .getItem('hideBanner')
      .then((hideBanner) => {
        this.setState({ show: !hideBanner });
      });
  }

  handleClose = (evt) => {
    evt.preventDefault();

    this.setState(
      { show: false },
      () => LocalDatabase.setItem('hideBanner', true)
    );
  }

  render() {
    if (!this.state.show) { return null; }

    return (
      <div className="ev-navbar__banner">
        <a
          href={this.state.extensionUrl}
          className="ev-navbar__banner-text"
          target='_blank'>
          We have news! 🥳 Now you can use a Browser Extension to share your files.
        </a>
        <a
          href="#"
          className="ev-navbar__banner-close"
          onClick={this.handleClose}>
          <i className="material-icons">close</i>
        </a>
      </div>
    );
  }
}

export default BannerComponent;
