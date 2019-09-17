import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

import Dialogs from '../lib/dialogs';
import { gaiaIndex } from '../lib/gaia_index';
import Page from '../lib/page';

class ExtensionNavbarComponent extends Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
  }

  handleInputChange = async (evt) => {
    await this.props.uploadFiles([...evt.target.files]);
    this.inputRef.current.value = null;
  }

  render() {
    return (
      <label className="ev-upload__label" htmlFor="file-upload">
        <nav className="ev-navbar ev-navbar--inverted ev-navbar--fixed">
          <ul className="ev-navbar__items">
            <li className="ev-navbar__item">
              <div className="ev-upload-btn">
                <i className="material-icons">add</i>
              </div>
            </li>
            <li className="ev-navbar__item  ev-navbar__item--no-pading">UPLOAD</li>
          </ul>
          <input
            ref={this.inputRef}
            className="ev-upload__input"
            id="file-upload"
            onChange={this.handleInputChange}
            type="file"
            name="file-upload"
          />
        </nav>
      </label>
    );
  }
}

export default ExtensionNavbarComponent;
