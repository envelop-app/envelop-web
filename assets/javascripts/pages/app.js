import React from "react";
import ReactDOM from "react-dom";
import { MDCMenu, Corner } from '@material/menu';
import FileListComponent from '../components/file_list.jsx'
import FileUploader from '../lib/file_uploader'
import { privateUserSession } from '../lib/blockstack_client';

function uploadRawFile(file) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const binaryString = evt.target.result;
    const options = { encrypt: false, verify: false };
    privateUserSession.putFile(file.name, binaryString, options)
  }
  reader.readAsBinaryString(file);
}

function showUploadInput() {
  const input = document.querySelector('.js-file-input');

  if (window.location.href.indexOf('?dev') != -1) {
    input.classList.remove('hide');
  }

  new FileUploader(input)
    .bind()
    .then(() => window.location = window.location.href);
}

function showNavbarUser() {
  const profile = privateUserSession.loadUserData();
  // TODO: use profile.name() and profile.avatarUrl()
  const navbarUserNode = document.querySelector('.js-navbar-user');

  const displayNameNode = document.querySelector('.js-username');
  const displayName = profile.email || profile.username.replace('.id.blockstack', '');
  navbarUserNode.classList.remove('hide');
  displayNameNode.innerText = displayName;

  const menu = new MDCMenu(document.querySelector('.js-accounts-menu'));
  menu.setAnchorCorner(Corner.BOTTOM_START);

  navbarUserNode.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    menu.open = !menu.open;
  })

  const logoutBtnNode = document.querySelector('.js-logout-btn');
  logoutBtnNode.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    privateUserSession.signUserOut();
    window.location = window.location.origin;
  })
}

function mountFileList() {
  const container = document.querySelector('.js-file-list-container');
  ReactDOM.render(<FileListComponent />, container);
}

function mountComponents() {
  mountFileList();
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
    showNavbarUser();
    showUploadInput();
    mountComponents();
  } else if (privateUserSession.isSignInPending()) {
    privateUserSession.handlePendingSignIn().then(userData => {
      window.location = window.location.href;
    });
  } else {
    window.location = window.location.origin;
  }
});

