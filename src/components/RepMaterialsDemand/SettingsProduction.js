import React, {Component, PropTypes} from "react";

import TabularSection from '../TabularSection'

import DataCell from 'components/DataField/DataCell'

import SettingsProductionToolbar from './SettingsProductionToolbar';

import classes from './RepMaterialsDemand.scss'

//options for priorities autocomplete editor
var CharacteristicEditor = <DataCell />

export default class SettingsProduction extends Component{

  static propTypes = {
    _obj: PropTypes.object
  }

  render(){

    const { _obj } = this.props

    return (

      <TabularSection
        _obj={_obj}
        _tabular="production"
        _columns={[
          {
            key: 'characteristic',
            name: 'Продукция',
            resizable : true,
            formatter: _obj.formatters.characteristic,
            editor: CharacteristicEditor
          },
          {
            key: 'qty',
            name: 'Штук',
            width : 90,
            resizable : true,
            editable : true
          }]}
        Toolbar={SettingsProductionToolbar}
        handleCustom={ () => { console.log('handleCustom') }}
      />
    )
  }
}
