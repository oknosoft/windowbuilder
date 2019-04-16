import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import {withIface} from 'metadata-redux';
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
    const {cell} = this;
    cell && cell.close && cell.close();
    super.componentWillUnmount();
  }

  render() {
    const {dialog} = this.props;
    const Dialog = dialog && dialog.Component;
    return [
      <div key="el" ref={el => this.el = el}/>,
      Dialog && <Dialog key="dialog" handlers={this.handlers} dialog={dialog} owner={this} />
    ];
  }

}

CalcOrderList.rname = 'CalcOrderList';

export default WindowSizer(withIface(CalcOrderList));


