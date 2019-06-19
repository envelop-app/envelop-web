import {AppConfig, Person, UserSession} from 'blockstack';

const appDomain = window.location.origin;
const redirectURI = `${window.location.origin}/app.html`;
const scopes = ['store_write', 'publish_data'];
const appConfig = new AppConfig(scopes, appDomain);
const userSession = new UserSession({ appConfig: appConfig });

document.addEventListener("DOMContentLoaded", event => {
  const loginControlsNode = document.querySelector('.ev-login-controls');
  const loginBtn = document.querySelector('.ev-login-btn');
  const goToAppBtn = document.querySelector('.ev-go-to-app-btn');
  const logoutBtn = document.querySelector('.ev-logout-btn');

  if (window.location.href.indexOf('?dev') != -1) {
    loginControlsNode.classList.remove('hide');
  }

  loginBtn.addEventListener('click', event => {
    event.preventDefault();
    userSession.redirectToSignIn(redirectURI);
  })

  logoutBtn.addEventListener('click', event => {
    event.preventDefault();
    userSession.signUserOut();
    window.location = window.location.href;
  });

  if (userSession.isUserSignedIn()) {
    goToAppBtn.classList.remove('hide');
    logoutBtn.classList.remove('hide');
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = redirectURI;
    });
  } else {
    loginBtn.classList.remove('hide');
  }
});
