/**
 * Индивидуальная форма отчета
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FrmReport from 'metadata-react/FrmReport';
import {withIface} from 'metadata-redux';

class RepMaterialsDemand extends Component {

  static propTypes = {
    _obj: PropTypes.object,
    _mgr: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    handleNavigate: PropTypes.func,

  };

  constructor(props, context) {
    super(props, context);
    const {_mgr, _obj} = props;
    this._obj = _obj || _mgr.create();

    this.state = {
      anchorEl: undefined,
      menuOpen: false,
    };
  }

  componentDidMount() {
    const {location} = this.props;
    const ref = location && location.search.replace(/\?/g, '');
    if(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(ref)) {
      this._obj.fill_by_order({_id: `doc.calc_order|${ref}`})
        .then(() => {
          this._report && this._report.forceUpdate();
        })
        .catch(() => {
          return null;
        });
    }
  }

  calcOrders(first) {
    let res = first ? {} : '';
    this._obj.production.forEach(({characteristic: {calc_order}}) => {
      if(!calc_order.empty()){
        if(first){
          res.ref = calc_order.ref;
          res.state = calc_order.state;
          return false;
        }
        else if(res.indexOf(calc_order.number_doc) == -1){
          if(res){
            res += ', ';
          }
          res += calc_order.number_doc;
        }
      }
    });
    return res;
  }

  handleMenuOpen = (event) => {
    this.setState({menuOpen: true, anchorEl: event.currentTarget}, () => this._report && this._report.forceUpdate());
  };

  handleMenuClose = () => {
    this.setState({menuOpen: false}, () => this._report && this._report.forceUpdate());
  };

  handleList = () => {
    //this.props.handleNavigate(`/${_mgr.class_name}/list${_obj ? '/?ref=' + _obj.ref : ''}`);
    const {ref, state} = this.calcOrders(true);
    if(ref && state){
      this.props.handleNavigate(`/?ref=${ref}&state_filter=${state}`);
    }
    else{
      this.props.handleNavigate(`/`);
    }
  }

  handleObj = () => {
    const {ref} = this.calcOrders(true);
    this.props.handleNavigate(`/doc.calc_order/${ref || 'list'}`);
  }

  ToolbarExt = () => {
    const {state} = this;
    const res = this.calcOrders();

    return [
      <Button key="go" size="small" onClick={this.handleMenuOpen} style={{alignSelf: 'center'}}>{res || 'Перейти'}</Button>,
      <Menu
        key="menu"
        anchorEl={state.anchorEl}
        open={state.menuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleObj}>В форму заказа</MenuItem>
        <MenuItem onClick={this.handleList}>В форму списка заказов</MenuItem>
      </Menu>
    ];
  };

  render() {
    const {props, _obj} = this;
    return <FrmReport ref={(el) => this._report = el} {...props} _obj={_obj} ToolbarExt={this.ToolbarExt}/>;
  }
}

RepMaterialsDemand.rname = 'RepMaterialsDemand';

export default withIface(RepMaterialsDemand);
