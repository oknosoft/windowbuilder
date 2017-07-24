import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';
import withIface from '../../redux/withIface';

class CalcOrderList extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers} = this;
    $p.doc.calc_order.form_list(cell, null, handlers);
  }

  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    const {cell, handlers} = this;
    if(cell && cell.close){
      cell.close();
    }
    super.componentWillUnmount();
  }

}

export default WindowSizer(withIface(CalcOrderList));


