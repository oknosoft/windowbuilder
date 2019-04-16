/**
 * Форма списка документа Расчет
 *
 * @module CalcOrderList
 *
 * Created by Evgeniy Malyarov on 05.10.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
//import DataList from 'metadata-react/DataList';
import DataList from 'metadata-react/DynList';
import WindowSizer from 'metadata-react/WindowSize';
import {withObj} from 'metadata-redux';
import qs from 'qs';

class CalcOrderList extends Component {

  constructor(props, context) {
    super(props, context);
    //this.state = {open: false};
  }

  handleSelect = (row, _mgr) => {
    this.handleRequestClose();
    this.props.handleSelect(row, _mgr);
  };

  render() {

    const {props: {windowHeight, windowWidth, handlers, location}, state} = this;

    const sizes = {
      windowHeight,
      windowWidth,
      height: windowHeight > 480 ? windowHeight - 52 : 428,
      width: windowWidth > 800 ? windowWidth - (windowHeight < 480 ? 20 : 0) : 800
    };

    const prm = qs.parse(location.search.replace('?',''));

    return (
      <DataList
        _mgr={$p.doc.calc_order}
        _acl={'e'}
        _ref={prm.ref}
        handlers={handlers}
        //selectionMode
        //denyAddDel
        //show_variants
        indexer
        show_search
        {...sizes}
      />
    );
  }
}

CalcOrderList.propTypes = {
  handlers: PropTypes.object.isRequired,
};

CalcOrderList.rname = 'CalcOrderList';

export default WindowSizer(withObj(CalcOrderList));

