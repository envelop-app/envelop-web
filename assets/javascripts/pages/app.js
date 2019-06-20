import React from "react";
import ReactDOM from "react-dom";
import { MDCMenu, Corner } from '@material/menu';
import { Person } from 'blockstack';
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
  const user = privateUserSession.loadUserData();
  const person = new Person(user.profile);

  const navbarUserNode = document.querySelector('.js-navbar-user');

  const displayNameNode = document.querySelector('.js-username');
  const displayName = person.name() || user.email || user.username.replace('.id.blockstack', '');
  displayNameNode.innerText = displayName;

  if (person.avatarUrl()) {
    const avatarImgNode = document.querySelector('.js-avatar');
    avatarImgNode.src = person.avatarUrl();
  }

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

  navbarUserNode.classList.remove('hide');
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

