/**
 * Выбор группы систем и подчиненного заказа
 */

import React from 'react';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {withStyles} from '@material-ui/core/styles';

const styles = (theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
});

const {cat: {templates, production_params}, doc: {calc_order}} = $p;
const _obj = templates._select_template;

class SelectOrder extends React.Component {

  constructor() {
    super();
    this.sys_grps = production_params.find_rows({is_folder: true});
    this.state = {orders: []};
    _obj.refill = false;
  }

  componentDidMount() {
    this.find_orders();
  }

  find_orders() {
    const orders = [];
    calc_order.find_rows({obj_delivery_state: 'Шаблон'}, (order) => {
      const permitted_sys = _obj.permitted_sys(order);
      if(!permitted_sys.length) {
        orders.push(order);
      }
      else {
        const {inh} = permitted_sys[0].path;
        for(const sys of inh) {
          if(sys._hierarchy(_obj.sys_grp)) {
            orders.push(order);
            return;
          }
        }
      }
    });
    if(!orders.includes(_obj.calc_order)) {
      if(orders.length) {
        _obj.calc_order = orders[0];
      }
      else {
        _obj.calc_order = '';
      }
    }
    this.setState({orders});
  }

  render() {
    const {props: {handleNext, classes}, state: {orders}, sys_grps} = this;
    return <>
      <FormControl fullWidth className={classes.formControl} title="Укажите группу систем">
        <InputLabel>Группа систем профилей</InputLabel>
        <Select
          value={_obj.sys_grp.ref}
          onChange={({target}) => {
            _obj.sys_grp = target.value;
            this.find_orders();
          }}
        >
          {sys_grps.map((grp, index) => <MenuItem key={`o-${index}`} value={grp.ref}>
            <Typography>{grp.name}</Typography>
          </MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl} title="Укажите заказ">
        <InputLabel>Расчет-заказ шаблонов</InputLabel>
        <Select
          value={_obj.calc_order.ref}
          onChange={({target}) => {
            _obj.calc_order = target.value;
          }}
        >
          {orders.map((order, index) => <MenuItem key={`o-${index}`} value={order.ref}>
            <Typography component="span">{`${order.note} \u00A0`}</Typography>
            <Typography component="span" variant="caption">{` ${order.number_doc}`}</Typography>
          </MenuItem>)}
        </Select>
      </FormControl>
    </>;
  }
}

export default withStyles(styles)(SelectOrder);
