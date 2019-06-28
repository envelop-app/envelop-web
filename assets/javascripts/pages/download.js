import React, { Component } from "react";
import ReactDOM from "react-dom";

import DownloadComponent from '../components/download.jsx';

function mountComponents() {
  const downloadContainer = document.querySelector('.js-download-container');
  ReactDOM.render(<DownloadComponent />, downloadContainer);
}

document.addEventListener("DOMContentLoaded", () => {
  mountComponents();
});
