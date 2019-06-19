import {AppConfig, Person, UserSession} from 'blockstack';
import React from "react";
import ReactDOM from "react-dom";
import FileListComponent from '../components/file_list.jsx'

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

function mountFileList() {
  const container = document.querySelector('.js-file-list-container');
  ReactDOM.render(<FileListComponent />, container);
}

function mountComponents() {
  mountFileList();
}

document.addEventListener("DOMContentLoaded", () => {
  if (userSession.isUserSignedIn()) {
    showNavbarUser(userSession.loadUserData());
    mountComponents();
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

