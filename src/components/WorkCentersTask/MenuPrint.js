import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconPrint from '@material-ui/icons/Print';
//import IconClose from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';

import Report1D from './Report1D';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class MenuPrint extends React.Component {
  state = {
    anchorEl: null,
    mode: '',
  };

  handleClick = event => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  handleCloseDialog = () => {
    this.setState({mode: ''});
  };

  handle1D = () => {
    this.setState({mode: '1D', anchorEl: null});
  };


  handle2D = () => {
    this.setState({mode: '2D', anchorEl: null});
  };


  render() {
    const { anchorEl, mode } = this.state;

    return (
      <div>
        <IconButton
          aria-haspopup="true"
          title="Печать"
          onClick={this.handleClick}
        >
          <IconPrint/>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handle1D}>Линейный</MenuItem>
          <MenuItem onClick={this.handle2D}>Двумерный</MenuItem>
        </Menu>
        <Dialog
          fullScreen
          open={Boolean(mode)}
          onClose={this.handleCloseDialog}
          TransitionComponent={Transition}
        >
          <Report1D {...this.props}/>
        </Dialog>
      </div>
    );
  }
}

MenuPrint.propTypes = {
  _obj: PropTypes.object.isRequired,             // объект документа-задания
};


export default MenuPrint;
