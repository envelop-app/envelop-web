import {AppConfig, UserSession} from 'blockstack';
import Constants from './constants';

function getUserSession(scopes) {
  const appConfig = new AppConfig(scopes, Constants.BLOCKSTACK_ORIGIN);
  return new UserSession({ appConfig: appConfig });
}

export const privateUserSession = getUserSession(['store_write', 'publish_data']);
export const publicUserSession = getUserSession([]);

const options = {
  redirectTo: '/',
  finished: ({ }) => {
    window.location = Constants.BLOCKSTACK_REDIRECT_URI;
  },
  userSession: privateUserSession,
  appDetails: {
    name: 'Envelop',
    icon: 'https://envelop.app/images/manifest-icon.png',
  },
};

const extensionOptions = options;
extensionOptions.finished = ({ }) => {
  window.location = Constants.BLOCKSTACK_EXTENSION_REDIRECT_URI;
}

export const authOptions = options;
export const extensionAuthOptions = extensionOptions;