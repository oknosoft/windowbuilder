import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../DhtmlxCell';

export default class CalcOrderObj extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();

  }

  onReize() {
    this.cell.setText('123');
  }


}


