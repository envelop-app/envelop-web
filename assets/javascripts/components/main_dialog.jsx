import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
} from '@material/react-dialog';

class MainDialogComponent extends Component {
  onClose = (action) => {
    if (action === 'accept') {
      this.props.onAccept && this.props.onAccept();
    }
    else if (action === 'dismiss') {
      this.props.onDismiss && this.props.onDismiss();
    }
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose}
      >
        {this.props.title ? <DialogTitle>{this.props.title}</DialogTitle> : ''}
        <DialogContent>
          <p>{this.props.body}</p>
        </DialogContent>
        <DialogFooter>
          <DialogButton action='dismiss'>
            {this.props.dismissText || 'Dismiss'}
          </DialogButton>
          <DialogButton action='accept' isDefault>
            {this.props.acceptText || 'Accept'}
          </DialogButton>
        </DialogFooter>
      </Dialog>
    );
  }
}

MainDialogComponent.propTypes = {
  acceptText: PropTypes.string,
  body: PropTypes.string,
  dismissText: PropTypes.string,
  onAccept: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};

export default MainDialogComponent;
