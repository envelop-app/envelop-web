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

    this.props.onClose && this.props.onClose();
  }

  render() {
    const { open, title, content, dismissText, acceptText } = this.props;

    return (
      <Dialog open={open} onClose={this.onClose}>
        {title ? <DialogTitle>{title}</DialogTitle> : ''}
        <DialogContent>{content && content}</DialogContent>
        <DialogFooter>
          {dismissText && <DialogButton action='dismiss'>{dismissText}</DialogButton>}
          {acceptText && <DialogButton action='accept'>{acceptText}</DialogButton>}
        </DialogFooter>
      </Dialog>
    );
  }
}

MainDialogComponent.propTypes = {
  acceptText: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  dismissText: PropTypes.string,
  onAccept: PropTypes.func,
  onClose: PropTypes.func,
  onDismiss: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
};

export default MainDialogComponent;
