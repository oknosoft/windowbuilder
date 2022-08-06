/**
 * Индивидуальная форма отчета
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FrmReport from 'metadata-react/FrmReport';

const _mgr = $p.rep.materials_demand;

class RepMaterialsDemand extends React.Component {

  constructor(props, context) {
    super(props, context);
    this._obj = props._obj || _mgr.create();

    const {cat: {scheme_settings}, wsql} = $p;
    const class_name = _mgr.class_name + '.' + _mgr._tabular;
    const scheme_name = scheme_settings.scheme_name(class_name);
    let scheme = wsql.get_user_param(scheme_name, 'string') || scheme_settings.find_rows({obj: class_name})
      .sort((a, b) => {
        if(a.order < b.order) {
          return 1;
        }
        if (a.order > b.order) {
          return -1;
        }
        if(a.user > b.user) {
          return 1;
        }
        if (a.user < b.user) {
          return -1;
        }
        if(a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      })[0];

    this.state = {
      anchorEl: undefined,
      menuOpen: false,
      scheme: scheme_settings.get(scheme),
    };
  }

  componentDidMount() {
    let {order: ref} = $p.utils.prm();
    if(!ref && location.pathname.startsWith('/builder')) {
      const ox = $p.cat.characteristics.get(location.pathname.substr(9));
      ref = ox.calc_order.ref;
    }

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
  };

  handleObj = () => {
    const {ref} = this.calcOrders(true);
    this.props.handleNavigate(`/doc.calc_order/${ref || 'list'}`);
  };

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
    const {props, state, _obj} = this;
    return <FrmReport
      ref={(el) => this._report = el}
      {...props}
      _mgr={_mgr}
      _obj={_obj}
      _tabular="specification"
      ToolbarExt={this.ToolbarExt}
      scheme={state.scheme}
      height={window.innerHeight - 48}
    />;
  }
}

RepMaterialsDemand.propTypes = {
  _obj: PropTypes.object,
  handleNavigate: PropTypes.func,
};


RepMaterialsDemand.rname = 'RepMaterialsDemand';

export default RepMaterialsDemand;
