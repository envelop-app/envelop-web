import { publicUserSession } from '../lib/blockstack_client'
import DocumentRemover from '../lib/document_remover'
import { privateUserSession } from '../lib/blockstack_client'
import Constants from '../lib/constants'
import prettyBytes from 'pretty-bytes';

const types = {
  image:   ['png', 'gif', 'jpg', 'jpeg', 'svg', 'tif', 'tiff', 'ico'],
  audio:   ['wav', 'aac', 'mp3', 'oga', 'weba', 'midi'],
  video:   ['avi', 'mpeg', 'mpg', 'mp4', 'ogv', 'webm', '3gp', 'mov'],
  archive: ['zip', 'rar', 'tar', 'gz', '7z', 'bz', 'bz2', 'arc'],
};

const version = 1;

class GaiaDocument {
  constructor(fields = {}) {
    this.id = fields.id;
    this.url = fields.url;
    this.size = fields.size;
    this.content_type = fields.content_type;
    this.created_at = fields.created_at;
    this.version = fields.version || version;
  }

  getName() {
    return this.url.split('/').pop();
  }

  getSizePretty() {
    return prettyBytes(this.size);
  }

  getType() {
    if (this._prettySize) { return this._prettySize; }

    for (var t in types) {
      if (types[t].includes(this.content_type)) {
        return this._prettySize = t;
      }
    }
    return this._prettySize = 'file';
  }

  delete() {
    return new DocumentRemover(this).remove();
  }

  serialize() {
    return {
      id: this.id || null,
      url: this.url || null,
      size: this.size || null,
      content_type: this.content_type || null,
      created_at: this.created_at || null,
      version: this.version || null
    };
  }

  shareUrl() {
    let username = privateUserSession.loadUserData().username;
    username = username.replace('.id.blockstack', '');
    return `${Constants.SHARE_ORIGIN}/d/${username}/${this.id}`;
  }

  toJSON() {
    return this.serialize();
  }
}

export default GaiaDocument;
