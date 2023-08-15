
import React from 'react';
import Grid from '@material-ui/core/Grid';
import TabularSection from 'metadata-react/TabularSection';
import DataField from 'metadata-react/DataField/PropField';
import DataObj from 'metadata-react/FrmObj/DataObj';
import withStyles from 'metadata-react/styles/paper600';
import {withIface} from 'metadata-redux';

import FillByPlanBtn from './FillByPlanBtn';

class PurchaseOrderObj extends DataObj {

  renderFields() {
    const {state: {_meta: {fields}, _obj}, props: {classes}} = this;

    return <Grid container spacing={2} >
      <Grid item xs={12} sm={4}>
        <DataField _obj={_obj} _fld="number_doc"/>
        <DataField _obj={_obj} _fld="date"/>
        <DataField _obj={_obj} _fld="shipping_date"/>
        <DataField key="note" _obj={_obj} _fld="note"/>
      </Grid>
      <Grid item xs={12} sm={4}>
        <DataField _obj={_obj} _fld="organization"/>
        <DataField _obj={_obj} _fld="partner"/>
        <DataField _obj={_obj} _fld="contract"/>
        <DataField _obj={_obj} _fld="doc_amount" read_only/>
      </Grid>
      <Grid item xs={12} sm={4}>
        <DataField _obj={_obj} _fld="department"/>
        <DataField _obj={_obj} _fld="warehouse"/>
        <DataField _obj={_obj} _fld="responsible"/>
      </Grid>
    </Grid>;
  }

  renderTabularSections() {
    const {_obj} = this.state;
    return <TabularSection _obj={_obj} _tabular="goods" btns={<FillByPlanBtn _obj={_obj}/>}/>;
  }

}


export default withStyles(withIface(PurchaseOrderObj));
