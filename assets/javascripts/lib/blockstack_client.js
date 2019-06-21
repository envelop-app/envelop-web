import {AppConfig, Person, UserSession} from 'blockstack';
import Constants from './constants';

function getUserSession(scopes) {
  const appConfig = new AppConfig(scopes, Constants.BLOCKSTACK_ORIGIN);
  return new UserSession({ appConfig: appConfig });
}

export const privateUserSession = getUserSession(['store_write', 'publish_data']);
export const publicUserSession = getUserSession([]);
