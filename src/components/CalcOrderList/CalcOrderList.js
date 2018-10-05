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
import DataList from 'metadata-react/DataList';
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

  find_rows = (selector) => {
    const {remote, props} = $p.adapters.pouch;
    const {username, password} = remote.doc.__opts.auth;

    selector.sort = [{date: 'desc'}];

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(username + ':' + password))));
    headers.append('suffix', props._suffix || '0');
    const opts = {
      method: 'post',
      credentials: 'include',
      headers,
      body: JSON.stringify(selector)
    };

    return fetch('/r/_find', opts)
      .then((res) => {
        if(res.status <= 201) {
          return res.json();
        }
        else {
          return res.text()
            .then((text) => {
              throw new Error(`${res.statusText}: ${text}`);
            });
        }
      })
      .then((data) => {
        data.docs.forEach((doc) => {
          doc.ref = doc._id.split('|')[1];
          delete doc._id;
        });
        return data;
      });
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
        find_rows={this.find_rows}
        //selectionMode
        //denyAddDel
        show_variants
        show_search
        {...sizes}
      />
    );
  }
}

CalcOrderList.propTypes = {
  handlers: PropTypes.object.isRequired,
};


export default WindowSizer(withObj(CalcOrderList));

