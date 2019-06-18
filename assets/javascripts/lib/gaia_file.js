import { AppConfig, UserSession } from 'blockstack';
import prettyBytes from 'pretty-bytes';

const defaultOptions = { decrypt: false, verify: false };
const types = {
  image:   ['png', 'gif', 'jpg', 'jpeg', 'svg', 'tif', 'tiff', 'ico'],
  audio:   ['wav', 'aac', 'mp3', 'oga', 'weba', 'midi'],
  video:   ['avi', 'mpeg', 'mpg', 'mp4', 'ogv', 'webm', '3gp', 'mov'],
  archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz', 'bz2', 'arc'],
};

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
        return {
          name: name,
          url: fullUrl,
          size: metadata.size,
          sizePretty: prettyBytes(+metadata.size),
          type: this.getType(metadata.content_type)
        };
      });
  }

  fetchMetadata() {
    return this.userSession()
      .getFile(this.filename, this.options())
      .then(JSON.parse)
  }

  fetchFullUrl(metadata) {
    return this.userSession().getFileUrl(metadata.url, this.options());
  }

  userSession() {
    if (this._userSession) { return this._userSession; }
    const appConfig = new AppConfig(this.appDomain);
    return this._userSession = new UserSession({ appConfig: appConfig });
  }

  options() {
    return { ...defaultOptions, app: this.appDomain, username: this.username };
  }

  getType(contentType) {
    for (var t in types) {
      if (types[t].includes(contentType)) {
        return t;
      }
    }
    return 'file';
  }
}

export default GaiaFile;
