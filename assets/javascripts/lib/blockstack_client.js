import {AppConfig, UserSession} from '@stacks/auth';
import { showConnect } from '@stacks/connect';
import Constants from './constants';

function getUserSession(scopes) {
  const appConfig = new AppConfig(scopes, Constants.BLOCKSTACK_ORIGIN);
  return new UserSession({ appConfig: appConfig });
}

const privateUserSession = getUserSession(['store_write', 'publish_data']);
const publicUserSession = getUserSession([]);

const authOptions = {
  redirectTo: '/',
  finished: () => window.location = Constants.BLOCKSTACK_REDIRECT_URI,
  userSession: privateUserSession,
  appDetails: {
    name: 'Envelop',
    icon: '/images/manifest-icon.png',
  }
}

const extensionAuthOptions = {
  ...authOptions,
  finished: () =>  {
    window.location = Constants.BLOCKSTACK_EXTENSION_REDIRECT_URI;
  }
}

function authenticate() {
  return showConnect(authOptions);
}

function extensionAuthenticate() {
  return showConnect(extensionAuthOptions);
}

export { authenticate, extensionAuthenticate, privateUserSession, publicUserSession };
