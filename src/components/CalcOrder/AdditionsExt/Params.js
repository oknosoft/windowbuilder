/**
 * ### Панель параметров текущего изделия
 *
 * @module Params
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import ExtProp from './ExtProp';

export default class Params extends React.Component {

  _refs = {};

  handleValueChange = (changed) => {
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this._refs[changed] -= 1;
      this.forceUpdate();
    }, 100);
  };

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  render() {
    const {row, inset, meta} = this.props;
    if(!row) {
      return <Typography variant="subtitle1" color="secondary">Нет параметров, либо не выбрана строка продукции</Typography>;
    }

    const {product_params, presentation} = inset;
    const res = [<Typography key="title" variant="subtitle1" color="primary">{`Параметры ${presentation}`}</Typography>];
    const struct = new Map();
    const {elm_positions} = $p.enm;
    product_params.forEach((row) => {
      if(row.pos.empty()) return;
      if(!struct.get(row.pos)) {
        struct.set(row.pos, []);
      }
      struct.get(row.pos).push(row);
    });

    const eProp = (v, i) => {
      const id = `${v.param.ref}-${i}`;
      if(!this._refs.hasOwnProperty(id)) {
        this._refs[id] = 0;
      }
      this._refs[id] += 1;
      return <ExtProp key={`${id}-${this._refs[id]}`} id={id} row={row} param={v.param} meta={meta} handleValueChange={this.handleValueChange}/>;
    };

    let frame = struct.get(elm_positions.top);
    if(frame) {
      res.push(<FormGroup key="top" row>{frame.map(eProp)}</FormGroup>);
    }

    if([1,2,3].some((v) => struct.get(elm_positions[`column${v}`]))) {
      res.push(<FormGroup key="columns" row>
        {[1,2,3].map((v) => {
          const column = struct.get(elm_positions[`column${v}`]);
          if(!column) return null;
          return <FormGroup key={`column${v}`}>{column.map(eProp)}</FormGroup>;
        })}
      </FormGroup>);
    }

    frame = struct.get(elm_positions.bottom);
    if(frame) {
      res.push(<FormGroup key="bottom" row>{frame.map(eProp)}</FormGroup>);
    }

    return res;

  }
}

Params.propTypes = {
  row: PropTypes.object,
  inset: PropTypes.object,
  meta: PropTypes.object,
};
