import { privateUserSession } from '../lib/blockstack_client';
import React from "react";
import ReactDOM from "react-dom";
import FileListComponent from '../components/file_list.jsx'
import FileUploader from '../lib/file_uploader'

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
  if (privateUserSession.isUserSignedIn()) {
    showNavbarUser(privateUserSession.loadUserData());
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

