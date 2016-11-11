import React, { Component, PropTypes } from 'react';

import {GridList, GridTile} from 'material-ui/GridList';
import Layout from '../react-flex-layout/react-flex-layout'
import LayoutSplitter from '../react-flex-layout/react-flex-layout-splitter'

import Toolbar from "./Toolbar";
import DataField from '../DataField'

import RepTabularSection from './RepTabularSection'

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
    this.props._obj.calculate()
      .then(() => {
        this.forceUpdate()
      })
  }

  handlePrint(){

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

    return (

      _obj
        ?
      <div>

        <Toolbar
          handleSave={::this.handleSave}
          handlePrint={::this.handlePrint}
          handleClose={this.props.handleClose}

          _obj={_obj}
        />

        <div className={classes.cont} style={{width: width - 20, height: height - 120}}>

          <RepTabularSection
            _obj={_obj}
            _tabular="specification"
            ref="specification"
            minHeight={height - 130}
          />

        </div>

      </div>
        :
      <DumbLoader />

    );
  }
}

