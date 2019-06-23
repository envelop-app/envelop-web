import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Person } from 'blockstack';
import copy from 'copy-to-clipboard';
import prettyBytes from 'pretty-bytes';
import { privateUserSession } from '../lib/blockstack_client'
import Toast from '../lib/toast.jsx'
import Menu, {MenuList, MenuListItem, MenuListItemText} from '@material/react-menu';

class AvatarComponent extends Component {
  constructor(props) {
    super(props);
    this.anchorRef = React.createRef();
    const user = privateUserSession.loadUserData();
    this.state = {
      coordinates: undefined,
      open: false,
      user: user,
      person: new Person(user.profile)
    };
  }

  componentDidMount() {
    this.setSize();
    window.addEventListener('resize', () => this.setSize());
  }

  setSize() {
    const anchorPosition = this.anchorRef.current.getBoundingClientRect();

    this.setState({
      coordinates: {
        x: anchorPosition.x + anchorPosition.width,
        y: anchorPosition.y + anchorPosition.height
      }
    });
  }

  avatarUrl() {
    return this.state.person.avatarUrl() || "/images/default-avatar.png";

  }

  displayName() {
    return this.state.person.name() ||
      this.state.user.email ||
      this.state.user.username.replace('.id.blockstack', '');
  }

  onOpen = () => {
    this.setState({open: true});
  }

  onClose = () => {
    this.setState({open: false});
  }

  onSelect = () => {
    privateUserSession.signUserOut();
    window.location = window.location.origin;
  }

  render() {
    return (
      <div ref={this.anchorRef} onClick={this.onOpen} style={{width: '100%', height: '100%'}}>
        <span className="ev-navbar__item-link">
          <span style={{paddingRight: '10px'}}>{this.displayName()}</span>
          <span className="ev-navbar__avatar">
            <img src={this.avatarUrl()} alt="avatar"/>
          </span>
        </span>
        <Menu
          open={this.state.open}
          onClose={this.onClose}
          coordinates={this.state.coordinates}
          onSelected={this.onSelect}
        >
          <MenuList>
            <MenuListItem>
              <MenuListItemText primaryText={'Log Out'} />
            </MenuListItem>
          </MenuList>
        </Menu>
      </div>
    );
  }
}

export default AvatarComponent;
