import React, { Component } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from '@material/react-material-icon';
import Menu, {
  MenuList,
  MenuListItem,
  MenuListItemText,
  MenuListItemGraphic
} from '@material/react-menu';
import { Corner } from '@material/menu';

import Constants from '../lib/constants';
import { privateUserSession } from '../lib/blockstack_client'

class ExtensionFooterComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  goToApp = (evt) => {
    evt.preventDefault();
    window.open(Constants.BLOCKSTACK_REDIRECT_URI);
  }

  handleKebabOpen = (evt) => {
    evt.preventDefault();
    this.setState({open: true});
  }

  handleKebabClose = () => {
    this.setState({open: false});
  }

  setAnchorElement = (element) => {
    if (this.state.anchorElement) {
      return;
    }
    this.setState({anchorElement: element});
  }

  onSelect = (item) => {
    if (item == 0) {
      window.open(Constants.FEEDBACK_URL, '_blank');
    }
    else if (item == 1) {
      privateUserSession.signUserOut();
      window.location = Constants.BLOCKSTACK_EXTENSION_REDIRECT_URI;
    }
  }

  renderMenu() {
    return (
      <Menu
        key="2"
        anchorCorner={Corner.BOTTOM_START}
        anchorElement={this.state.anchorElement}
        open={this.state.open}
        onClose={this.handleKebabClose}
        onSelected={this.onSelect}
      >
        <MenuList>
          <MenuListItem>
            <MenuListItemText primaryText={'Send us feedback'} />
          </MenuListItem>
          <MenuListItem>
            <MenuListItemText primaryText={'Logout'} />
          </MenuListItem>
        </MenuList>
      </Menu>
    );
  }


  render() {
    return (
      <nav className="ev-extension-footer">
        <div className="ev-extension-footer__text">
          Alt + Shift + E <span className="ev-text-secondary">to open this window</span>
        </div>
        {this.renderMenu()}
        <div className="ev-extension-footer__btn-wrapper">
          <a
            className="ev-extension-footer__icon"
            href=""
            onClick={this.goToApp}>
            <i className="material-icons">input</i>
          </a>
          <a
            className="ev-extension-footer__icon"
            href=""
            onClick={this.handleKebabOpen}
            ref={this.setAnchorElement}>
            <i className="material-icons">more_vert</i>
          </a>
        </div>
      </nav>
    );
  }
}

export default ExtensionFooterComponent;
