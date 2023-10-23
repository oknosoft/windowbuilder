/**
 * Свойства вставки в элемент
 *
 * @module ElmInsetProps
 *
 * Created by Evgeniy Malyarov on 29.08.2021.
 */

import React from 'react';
import PropTypes from 'prop-types';
import LinkedProp from 'wb-forms/dist/Common/LinkedProp';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';

class ElmInsetProps extends React.Component {

  constructor(props, context) {
    super(props, context);
    this._refs = {};
  }

  componentDidMount() {
    const {elm} = this.props;
    elm?.project?._scope?.eve.on('region_change', this.region_change);
  }

  componentWillUnmount() {
    const {elm} = this.props;
    elm?.project?._scope?.eve.off('region_change', this.region_change);
  }

  region_change = (_obj, fld) => {
    const {elm} = this.props;
    if(elm && _obj.row === elm.row && this._refs[fld]) {
      this._refs[fld].setState({value: _obj[fld]});
    }
  };

  ref_fn(fld) {
    return (el) => {
      this._refs[fld] = el;
    };
  }

  render() {
    const {elm, row, inset} = this.props;
    if(!elm || !row) {
      return null;
    }
    const {Editor} = $p;
    const isProfile = elm instanceof Editor.ProfileItem;
    const content = [];
    if(isProfile) {
      const {fields} = elm._metadata;
      const clr_group = $p.cat.clrs.selection_exclude_service(fields.clr, elm, elm.ox);
      content.push(
        <FieldClr key="aip-clr" _obj={row} _fld="clr" _meta={fields.clr} clr_group={clr_group}/>,
      );
      elm.elm_props(row.inset).forEach((param) => {
        const {ref} = param;
        const _fld = row.region ? ref : (row.inset.ref + ref);
        content.push(<LinkedProp key={_fld} _obj={elm} _fld={_fld} param={param} cnstr={-elm.elm} inset={row.inset} fields={fields}/>);
      });
    }
    else if (!elm.elm) {
      const {fields} = elm._metadata;
      const _obj = elm.region(row);
      for(const param of row.inset.used_params()) {
        const {ref} = param;
        content.push(<LinkedProp key={`prm0-${ref}`} _obj={_obj} _fld={ref} param={param} cnstr={0} inset={row.inset} fields={fields} />);
      }
    }
    else if(elm instanceof Editor.Filling) {
      for(const param of row.inset.used_params()) {
        const {ref} = param;
        const _obj = row._owner._owner.params.find({cnstr: row.cnstr, region: 0, inset: row.inset, param});
        if(_obj) {
          const {fields} = _obj._metadata();
          content.push(<LinkedProp key={`prm0-${ref}`} _obj={_obj} param={param} cnstr={row.cnstr} inset={row.inset} fields={fields} />);
        }
      }
    }
    else {
      content.push('ElmInsetProps');
    }
    return content;
  }
}

export default ElmInsetProps;

ElmInsetProps.propTypes = {
  elm: PropTypes.object, // элемент рисовалки
  row: PropTypes.object, // строка допвставки в текущей продукции
};
