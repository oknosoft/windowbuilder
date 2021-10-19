/**
 * Свойства вставки в элемент
 *
 * @module ElmInsetProps
 *
 * Created by Evgeniy Malyarov on 29.08.2021.
 */

import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

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
    const {elm, row} = this.props;
    if(!elm || !row) {
      return null;
    }
    const {Editor} = $p;
    const isProfile = elm instanceof Editor.ProfileItem;
    if(isProfile) {
      const _obj = row.region ? elm.region(row.region) : elm;
      const {fields} = _obj._metadata;
      const content = row.region ? [
        <PropField fullWidth key="aip-clr" _obj={row} _fld="clr" empty_text="Авто"/>,
        <PropField fullWidth key="aip-cnn1" _obj={_obj} _fld="cnn1" _meta={fields.cnn1} get_ref={this.ref_fn('cnn1')} empty_text="Авто" />,
        <PropField fullWidth key="aip-cnn2" _obj={_obj} _fld="cnn2" _meta={fields.cnn2} get_ref={this.ref_fn('cnn2')} empty_text="Авто" />,
      ] : [];
      _obj.elm_props(row.inset).forEach(({ref}) => {
        const _fld = row.region ? ref : (row.inset.ref + ref);
        content.push(<PropField key={_fld} fullWidth _obj={_obj} _fld={_fld} _meta={fields[ref]} get_ref={this.ref_fn(_fld)}/>);
      });
      return content;
    }
    return 'ElmInsetProps';
  }
}

export default ElmInsetProps;

ElmInsetProps.propTypes = {
  elm: PropTypes.object, // элемент рисовалки
  row: PropTypes.object, // строка допвставки в текущей продукции
};
