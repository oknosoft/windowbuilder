import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';

class CalcOrderObj extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();

  }

  onReize() {
    this.cell.setText('123');
  }


}


