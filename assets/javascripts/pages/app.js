import React from "react";
import ReactDOM from "react-dom";
import FileListComponent from '../components/file_list.jsx'
import AvatarComponent from '../components/avatar.jsx'
import FileUploader from '../lib/file_uploader'
import { privateUserSession } from '../lib/blockstack_client';

function showUploadInput() {
  const input = document.querySelector('.js-file-input');

  if (window.location.href.indexOf('?dev') != -1) {
    input.classList.remove('hide');
  }

  new FileUploader(input)
    .bind()
    .then(() => window.location = window.location.href);
}

function mountComponents() {
  const avatarContainer = document.querySelector('.js-navbar-user');
  ReactDOM.render(<AvatarComponent />, avatarContainer);

  const fileListContainer = document.querySelector('.js-file-list-container');
  ReactDOM.render(<FileListComponent />, fileListContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  if (privateUserSession.isUserSignedIn()) {
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

