/**
 * ### Выбор варианта сохраненных настроек
 * @module SchemeSettingsSelect
 *
 * Created 19.12.2016
 */

import React, { Component, PropTypes } from 'react';
import DataList from "../DataList"
import DataField from "../DataField";

export default class SchemeSettingsSelect extends Component{

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  static propTypes = {
    scheme: PropTypes.object.isRequired,
    handleSchemeChange: PropTypes.func.isRequired
  }

  constructor(props, context) {

    super(props, context)

    const {scheme} = props
    const {$p} = context
    const _mgr = $p.dp.scheme_settings

    // экземпляр обработки для выбора варианта
    if(!_mgr[scheme.obj]){
      _mgr[scheme.obj] = $p.dp.scheme_settings.create()
    }

    this.state = {
      _obj: _mgr[scheme.obj],
      _meta: Object.assign({}, _mgr.metadata("scheme"))
    }
    this.state._obj.scheme = scheme

    // корректируем метаданные поля выбора варианта
    this.state._meta.choice_params = [{
      name: "obj",
      path: scheme.obj
    }]
  }

  render() {

    const {_obj, _meta} = this.state
    const {scheme, handleSchemeChange} = this.props

    const subProps = {
      _meta: _meta,
      _obj: _obj,
      _fld: "scheme",
      _val: scheme,
      handleValueChange: handleSchemeChange
    }

    return (
      <DataField {...subProps} />
    );
  }
}