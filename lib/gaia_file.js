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
    const options = {
      ...defaultOptions,
      username: this.username
    };
    return this.userSession().getFile(this.filename, options);
  }

  userSession() {
    const appConfig = new blockstack.AppConfig([], this.appDomain);
    return new blockstack.UserSession({ appConfig: appConfig });
  }
}

module.exports = GaiaFile;
