/**
 * Индивидуальная форма отчета
 */

import React, {Component} from 'react';
import Button from 'material-ui/Button';
import Menu, {MenuItem} from 'material-ui/Menu';
import FrmReport from 'metadata-react/FrmReport';
import {withIface} from 'metadata-redux';

class RepMaterialsDemand extends Component {

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
        .catch((err) => {
          return null;
        });
    }
  }

  handleMenuOpen = (event) => {
    this.setState({menuOpen: true, anchorEl: event.currentTarget}, () => this._report && this._report.forceUpdate());
  };

  handleMenuClose = () => {
    this.setState({menuOpen: false}, () => this._report && this._report.forceUpdate());
  };

  handleList = () => {
    //this.props.handleNavigate(`/${_mgr.class_name}/list${_obj ? '/?ref=' + _obj.ref : ''}`);
    this.props.handleNavigate(`/`);
  }

  handleObj = () => {
    this.props.handleNavigate(`/doc.calc_order/list`);
  }

  ToolbarExt = () => {
    const {props, state, _obj} = this;
    let res = '';
    _obj.production.forEach(({characteristic}) => {
      if(res.indexOf(characteristic.calc_order.number_doc) == -1){
        if(res){
          res += ', ';
        }
        res += characteristic.calc_order.number_doc;
      }
    });
    return [
      <Button key="go" dense onClick={this.handleMenuOpen} style={{alignSelf: 'center'}}>{res || 'Перейти'}</Button>,
      <Menu
        key="menu"
        anchorEl={state.anchorEl}
        open={state.menuOpen}
        onRequestClose={this.handleMenuClose}
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

export default withIface(RepMaterialsDemand);
