import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';

class CalcOrderObj extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();

  }

  onReize() {
    this.cell.setText('123');
  }


}


