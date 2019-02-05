import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import {withIface} from 'metadata-redux';
import {set_state_and_title} from '../App/menu_items';

class CalcOrderList extends DhtmlxCell {

  componentDidMount() {

    let {location, state_filter, date_from_filter, date_till_filter, filter_filter, handleIfaceState} = this.props;
    const search = $p.job_prm.parse_url_str(location.search);
    
    // фильтр по состоянию заказов
    if (search.state_filter && search.state_filter != state_filter) {
      state_filter = search.state_filter;
    }
    else if (!state_filter) {
      state_filter = 'draft';
    }
    set_state_and_title(state_filter, handleIfaceState);

    // фильтр по начальной дате
    if (search.date_from_filter && search.date_from_filter != date_from_filter) {
      date_from_filter = search.date_from_filter;
    }
    else if (!date_from_filter) {
      date_from_filter = moment().subtract(2, 'month').toDate().toString();
    }
    handleIfaceState({
      component: 'CalcOrderList',
      name: 'date_from_filter',
      value: date_from_filter
    });

    // фильтр по конечной дате
    if (search.date_till_filter && search.date_till_filter != date_till_filter) {
      date_till_filter = search.date_till_filter;
    }
    else if (!date_till_filter) {
      date_till_filter = moment().add(1, 'month').toDate().toString();
    }
    handleIfaceState({
      component: 'CalcOrderList',
      name: 'date_till_filter',
      value: date_till_filter
    });

    // фильтр по поисковой строке
    if (search.filter_filter && search.filter_filter != filter_filter) {
      filter_filter = search.filter_filter;
    }
    else if (!filter_filter) {
      filter_filter = '';
    }
    handleIfaceState({
      component: 'CalcOrderList',
      name: 'filter_filter',
      value: filter_filter
    });

    super.componentDidMount();
    const {cell, handlers} = this;
    $p.doc.calc_order.form_list(cell, {
      date_from: Date.parse(date_from_filter),
      date_till: Date.parse(date_till_filter),
      filter: filter_filter
    }, handlers);
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

export default WindowSizer(withIface(CalcOrderList));


