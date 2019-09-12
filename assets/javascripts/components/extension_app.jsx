import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';

class ExtensionAppComponent extends Component {

  showEmptyState() {
    return true;
  }

  render() {
    return (
      <div className="ev-extension-app__container">
        {this.showEmptyState() ?
            <div className="ev-extension-app__empty-state">
              <img className="ev-extension-app__empty-state-image" src="/images/bg-empty-state.svg" />
              <div className="ev-extension-app__empty-state-text">
                Drag and drop<br/> to upload
              </div>
            </div>
            :
            ""
        }
      </div>
    );
  }
}

export default ExtensionAppComponent;
