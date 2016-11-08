import React, { Component, PropTypes } from 'react';

import {GridList, GridTile} from 'material-ui/GridList';
import Layout from '../react-flex-layout/react-flex-layout'
import LayoutSplitter from '../react-flex-layout/react-flex-layout-splitter'

import Toolbar from "./Toolbar";
import DataField from '../DataField'

import TabularSection from '../TabularSection'

import DumbLoader from '../DumbLoader'


import classes from './RepMaterialsDemand.scss'


import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: '8px'
  },
  block: {
    //flex: '1 100%',
    fontWeight: 'bold'
  }
}

export default class RepMaterialsDemand extends Component {

  static propTypes = {
    _obj: PropTypes.object,
    _acl: PropTypes.string.isRequired,

    handleSave: PropTypes.func.isRequired,
    handleRevert: PropTypes.func.isRequired,
    handleMarkDeleted: PropTypes.func.isRequired,
    handlePost: PropTypes.func.isRequired,
    handleUnPost: PropTypes.func.isRequired,
    handlePrint: PropTypes.func.isRequired,
    handleAttachment: PropTypes.func.isRequired,
    handleValueChange: PropTypes.func.isRequired,
    handleAddRow: PropTypes.func.isRequired,
    handleDelRow: PropTypes.func.isRequired
  }

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  constructor(props, context) {

    super(props);

    const { $p } = context

    this.state = {
      characteristic_mgr: $p.cat.characteristics
    };

  }

  handleSave(){

    this.props.handleSave(this.props._obj)
  }

  handleSend(){

    this.props.handleSave(this.props._obj)

  }

  handleMarkDeleted(){

  }

  handlePrint(){

  }

  handleAttachment(){

  }

  handleValueChange(_fld){
    return (event, value) => {
      const { _obj, handleValueChange } = this.props
      const old_value = _obj[_fld]
      _obj[_fld] = (value || (event && event.target ? event.target.value : ''))
      handleValueChange(_fld, old_value)
    }
  }


  render() {

    const { _obj, height, width } = this.props

    const { characteristic_mgr } = this.state

    return (

      _obj
        ?
      <div>

        <Toolbar
          handleSave={::this.handleSave}
          handleSend={::this.handleSend}
          handleMarkDeleted={::this.handleMarkDeleted}
          handlePrint={::this.handlePrint}
          handleAttachment={::this.handleAttachment}
          handleClose={this.props.handleClose}
        />

        <div className={classes.cont} style={{width: width}}>

          <Layout layoutWidth={width - 24} layoutHeight={height - 120} >
            <Layout layoutWidth={'flex'}>

              <TabularSection
                _obj={_obj}
                _tabular="specification"

              />

            </Layout>
            <LayoutSplitter />
            <Layout layoutWidth={Math.floor((width - 24)/4)}>

              {// <DataField _obj={_obj} _fld="Санаторий" handleValueChange={this.handleValueChange("Санаторий")} />
              }

              <TabularSection
                _obj={_obj}
                _tabular="production"
                _columns={[
                  {
                    key: 'characteristic',
                    name: 'Продукция',
                    resizable : true,
                    width : 160,
                    formatter: v => {
                      v = characteristic_mgr.get(v.value)
                      return (<div>{v instanceof Promise ? 'loading...' : v.presentation}</div>)
                    }
                  },
                  {
                    key: 'qty',
                    name: 'Штук',
                    resizable : true

                  }]}
              />

            </Layout>
          </Layout>

        </div>

      </div>
        :
      <DumbLoader />

    );
  }
}

