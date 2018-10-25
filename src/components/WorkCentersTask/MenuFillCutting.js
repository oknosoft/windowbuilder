import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconFill from '@material-ui/icons/FormatColorFill';

class MenuFillCutting extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleFill1D = () => {
    this.props.handleFillCutting({
      linear: true,
    });
    this.handleClose();
  };

  handleFill1DClr = () => {
    this.props.handleFillCutting({
      linear: true,
      clr_only: true,
    });
    this.handleClose();
  };

  handleFill2D = () => {
    this.props.handleFillCutting({
      bilinear: true,
    });
    this.handleClose();
  };

  handleFillAll = () => {
    this.props.handleFillCutting({
      bilinear: true,
      linear: true,
    });
    this.handleClose();
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
        <IconButton
          aria-haspopup="true"
          title="Заполнить"
          onClick={this.handleClick}
        >
          <IconFill/>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleFill1D}>Линейный</MenuItem>
          <MenuItem onClick={this.handleFill1DClr}>Линейный (только цвет)</MenuItem>
          <MenuItem onClick={this.handleFill2D}>Двумерный</MenuItem>
          <MenuItem onClick={this.handleFillAll}>Все виды</MenuItem>
        </Menu>
      </div>
    );
  }
}

MenuFillCutting.propTypes = {
  handleFillCutting: PropTypes.func.isRequired,
};


export default MenuFillCutting;
