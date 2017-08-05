// import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';
import withIface from '../../redux/withIface';
import {set_state_and_title} from '../App/menu_items';

class CalcOrderList extends DhtmlxCell {

  componentDidMount() {

    let {location, state_filter, handleIfaceState} = this.props;
    const search = $p.job_prm.parse_url_str(location.search);
    if (search.state_filter && search.state_filter != state_filter) {
      state_filter = search.state_filter;
    }
    else if (!state_filter) {
      state_filter = 'draft';
    }
    set_state_and_title(state_filter, handleIfaceState);

    super.componentDidMount();
    const {cell, handlers} = this;
    $p.doc.calc_order.form_list(cell, null, handlers);
  }

  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    const {cell} = this;
    if (cell && cell.close) {
      cell.close();
    }
    super.componentWillUnmount();
  }

}

export default WindowSizer(withIface(CalcOrderList));


