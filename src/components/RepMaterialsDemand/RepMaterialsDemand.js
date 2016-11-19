import React, { Component, PropTypes } from 'react';

import {GridList, GridTile} from 'material-ui/GridList';
import Layout from '../react-flex-layout/react-flex-layout'
import LayoutSplitter from '../react-flex-layout/react-flex-layout-splitter'

import Toolbar from "./Toolbar";
import DataField from 'components/DataField'

import RepTabularSection from './RepTabularSection'

import DumbLoader from '../DumbLoader'

import classes from './RepMaterialsDemand.scss'


export default class RepMaterialsDemand extends Component {

  static propTypes = {
    _obj: PropTypes.object,
    _acl: PropTypes.string.isRequired,

    handleSave: PropTypes.func.isRequired,
    handleRevert: PropTypes.func.isRequired,
    handleMarkDeleted: PropTypes.func.isRequired,
    handlePrint: PropTypes.func.isRequired,
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
        this.refs.specification.setState({groupBy: []})
        //this.forceUpdate()
      })
  }

  handlePrint(){

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

        <div className={classes.cont} style={{width: width - 20, height: height - 150}}>

          <RepTabularSection
            _obj={_obj}
            _tabular="specification"
            ref="specification"
            minHeight={height - 160}
          />

        </div>

      </div>
        :
      <DumbLoader />

    );
  }
}

