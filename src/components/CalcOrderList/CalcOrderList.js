/**
 * Форма списка документа Расчет
 *
 * @module CalcOrderList
 *
 * Created by Evgeniy Malyarov on 05.10.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

//import IconButton from '@material-ui/core/IconButton';
import DataList from 'metadata-react/DynList';
import WindowSizer from 'metadata-react/WindowSize';
import {withObj} from 'metadata-redux';
import qs from 'qs';
import handleSchemeChange from './scheme_change';
import Svgs from '../Svgs';

const heights = new Map();
heights.set(true, 24);
heights.set(false, 90);

class CalcOrderList extends Component {

  constructor(props, context) {
    super(props, context);
    this.handlers = Object.assign({}, this.props.handlers, {handleSchemeChange: handleSchemeChange.bind(this)});
    this.state = {
      hidden: $p.wsql.get_user_param('svgs_area_hidden', 'boolean'),
      imgs: [],
    };
    this.timer = 0;
    this.prev_ref = '';
  }

  // handleSelect = (row, _mgr) => {
  //   this.handleRequestClose();
  //   this.props.handleSelect(row, _mgr);
  // };

  handleRowSelect = ({selectedRow}) => {
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if(selectedRow && this.prev_ref !== selectedRow.ref) {

        if(this.state.hidden) {
          return this.prev_ref = selectedRow.ref;
        }

        // Получаем идентификаторы продукций с вложениями
        const keys = [];
        if(!$p.utils.is_data_obj(selectedRow)) {
          const {doc} = $p.adapters.pouch.local;
          doc.get(`doc.calc_order|${selectedRow.ref}`)
            .then(({production}) => {
              production && production.forEach(({characteristic}) => {
                !$p.utils.is_empty_guid(characteristic) && keys.push(`cat.characteristics|${characteristic}`);
              });
              return keys.length ? doc.allDocs({keys, limit: keys.length, include_docs: true}) : {rows: keys};
            })
            .then(({rows}) => {
              rows.forEach(({id, doc}) => {
                if(doc && doc.svg) {
                  const ind = keys.indexOf(id);
                  keys[ind] = {ref: id.substr(20), svg: doc.svg};
                }
              });
              return keys.filter((v) => v.svg);
            })
            .then((keys) => {
              this.prev_ref = selectedRow.ref;
              this.setState({imgs: keys});
            })
            .catch($p.record_log);
        }
        else {
          selectedRow.production.forEach(({characteristic: {ref, svg}}) => {
            svg && keys.push({ref, svg});
          });
          this.prev_ref = selectedRow.ref;
          this.setState({imgs: keys});
        }
      }
      else {
        this.prev_ref = '';
        this.setState({imgs: []});
      }
    }, 300);
  };

  reverseHide = () => {
    const hidden = !this.state.hidden;
    $p.wsql.set_user_param('svgs_area_hidden', hidden);
    this.setState({hidden}, () => {
      if(!hidden && this.prev_ref) {
        const {prev_ref} = this;
        this.prev_ref = '';
        this.handleRowSelect({selectedRow: {ref: prev_ref}});
      }
    });
  };

  render() {

    const {props: {windowHeight, windowWidth, location}, state: {hidden, imgs}, handlers} = this;

    const sizes = {
      windowHeight,
      windowWidth,
      height: (windowHeight > 480 ? windowHeight - 51 : 428) - heights.get(hidden),
      width: windowWidth > 800 ? windowWidth - (windowHeight < 480 ? 20 : 0) : 800
    };

    const prm = qs.parse(location.search.replace('?',''));

    return [
      <DataList
        key="list"
        _mgr={$p.doc.calc_order}
        _acl={'e'}
        _ref={prm.ref}
        handlers={handlers}
        onRowSelect={this.handleRowSelect}
        //selectionMode
        //denyAddDel
        //show_variants
        indexer
        show_search
        {...sizes}
      />,
      <Svgs
        key="svgs"
        hidden={hidden}
        imgs={imgs}
        height={heights.get(hidden) - 2}
        reverseHide={this.reverseHide}
        handleNavigate={handlers.handleNavigate}
      />
    ];
  }
}

CalcOrderList.propTypes = {
  handlers: PropTypes.object.isRequired,
  windowHeight: PropTypes.number,
  windowWidth: PropTypes.number,
  location: PropTypes.object,
};

CalcOrderList.rname = 'CalcOrderList';

export default WindowSizer(withObj(CalcOrderList));

