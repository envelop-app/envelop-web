import {AppConfig, Person, UserSession} from 'blockstack';

const appDomain = window.location.origin;

function getUserSession(scopes) {
  const appConfig = new AppConfig(scopes, appDomain);
  return new UserSession({ appConfig: appConfig });
}

export const privateUserSession = getUserSession(['store_write', 'publish_data']);
export const publicUserSession = getUserSession([]);
