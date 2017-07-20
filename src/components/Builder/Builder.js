import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';

class Builder extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();

  }

  onReize() {
    this.cell.setText('123');
  }


}

export default WindowSizer(Builder);

