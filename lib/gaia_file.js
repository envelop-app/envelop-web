const blockstack = require('blockstack');
const app = require('../app');

const defaultOptions = { decrypt: false, verify: false };

class GaiaFile {
  constructor(appDomain, username, filename) {
    this.appDomain = appDomain;
    this.username = username;
    this.filename = filename;
  }

  fetch() {
    return this.fetchMetadata()
      .then(metadata => Promise.all([metadata, this.fetchFullUrl(metadata)]))
      .then(([metadata, fullUrl]) => {
        const name = metadata.url.split('/').pop();
        return { name: name, url: fullUrl, size: metadata.size };
      });
  }

  fetchMetadata() {
    return this .userSession()
      .getFile(this.filename, this.options())
      .then(JSON.parse)
  }

  fetchFullUrl(metadata) {
    return this.userSession().getFileUrl(metadata.url, this.options());
  }

  userSession() {
    if (this._userSession) { return this._userSession; }
    const appConfig = new blockstack.AppConfig([], this.appDomain);
    return this._userSession = new blockstack.UserSession({ appConfig: appConfig });
  }

  options() {
    return { ...defaultOptions, username: this.username };
  }
}

module.exports = GaiaFile;
