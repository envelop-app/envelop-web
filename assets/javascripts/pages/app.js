import {AppConfig, Person, UserSession} from 'blockstack';

const appDomain = window.location.origin;
const scopes = ['store_write', 'publish_data'];
const appConfig = new AppConfig(scopes, appDomain);
const userSession = new UserSession({ appConfig: appConfig });

function showNavbarUser(profile) {
  const navbarUserNode = document.querySelector('.js-navbar-user');
  const displayNameNode = document.querySelector('.js-username');
  const displayName = profile.email || profile.username.replace('.id.blockstack', '');
  navbarUserNode.classList.remove('hide');
  displayNameNode.innerText = displayName;
}

document.addEventListener("DOMContentLoaded", () => {
  if (userSession.isUserSignedIn()) {
    showNavbarUser(userSession.loadUserData());
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

