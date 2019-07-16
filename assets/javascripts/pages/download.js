import React, { Component } from "react";
import ReactDOM from "react-dom";

import DownloadComponent from '../components/download.jsx';

import { privateUserSession, } from '../lib/blockstack_client';

import Record from '../lib/records/record';
Record.config({ session: privateUserSession });

function mountComponents() {
  const downloadContainer = document.querySelector('.js-download-container');
  ReactDOM.render(<DownloadComponent />, downloadContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  mountComponents();
});
