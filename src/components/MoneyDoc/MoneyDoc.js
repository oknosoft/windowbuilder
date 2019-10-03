/**
 *
 *
 * @module MoneyDoc
 *
 * Created by Evgeniy Malyarov on 03.05.2019.
 */

import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import DataField from 'metadata-react/DataField';
import TabularSection from 'metadata-react/TabularSection';
import DataObj from 'metadata-react/FrmObj/DataObj';
import withStyles from 'metadata-react/styles/paper600';
import {withIface} from 'metadata-redux';

class MoneyDoc extends DataObj {

  renderFields() {
    const {state: {_meta: {fields}, _obj}, props: {classes}} = this;

    return [
      <FormGroup row key="group_sys">
        <DataField _obj={_obj} _fld="number_doc"/>
        <DataField _obj={_obj} _fld="date"/>
      </FormGroup>,
      <FormGroup row key="row1">
        <DataField _obj={_obj} _fld="organization"/>
        <DataField _obj={_obj} _fld="partner"/>
        <DataField _obj={_obj} _fld="department"/>
      </FormGroup>,
      <FormGroup row key="row2" className={classes.paddingBottom}>
        {Object.prototype.hasOwnProperty.call(fields, 'cashbox') && <DataField _obj={_obj} _fld="cashbox"/>}
        {Object.prototype.hasOwnProperty.call(fields, 'bank_account') && <DataField _obj={_obj} _fld="bank_account"/>}
        <DataField _obj={_obj} _fld="responsible"/>
        <DataField _obj={_obj} _fld="doc_amount" read_only/>
      </FormGroup>,
    ];
  }

  renderTabularSections() {
    const {_obj} = this.state;

    return [
      <FormGroup key="rows" style={{height: 300}}>
        <TabularSection _obj={_obj} _tabular="payment_details"/>
      </FormGroup>,
      <DataField key="note" _obj={_obj} _fld="note"/>
    ];
  }
}

MoneyDoc.rname = 'MoneyDoc';

export default withStyles(withIface(MoneyDoc));
