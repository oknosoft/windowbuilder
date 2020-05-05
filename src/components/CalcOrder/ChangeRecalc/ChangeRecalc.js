/**
 * Пересчет заказа с подменой систем и параметров
 *
 * @module ChangeRecalc
 *
 * Created by Evgeniy Malyarov on 05.05.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import Stepper from './Stepper';

const title = 'Пересчет с заменой параметров';

class ChangeRecalc extends React.Component {

  constructor(props, context) {
    const {ref, _mgr} = props.dialog;
    super(props, context);
    this.state = {ready: false};
    this.obj = _mgr.get(ref);
    this.params = new Map();
    const dp = this.dp = $p.dp.buyers_order.create();
    dp.production.load(this.obj.production);
    dp.production.forEach((row) => {
      row.use = true;
      const {characteristic} = row;
      if(dp.sys.empty() && !characteristic.sys.empty()) {
        dp.sys = characteristic.sys;
      }
      if(dp.clr.empty()) {
        characteristic.coordinates.find_rows({elm_type: $p.enm.elm_types.Рама}, (row) => {
          if(!row.clr.empty()) {
            dp.clr = row.clr;
            return false;
          }
        })
      }
      if(dp.furn.empty()) {
        characteristic.constructions.forEach((row) => {
          if(!row.furn.empty()) {
            dp.furn = row.furn;
            return false;
          }
        })
      }
      if(dp.inset.empty()) {
        characteristic.glasses.find_rows({is_sandwich: false}, ({elm}) => {
          const row = characteristic.coordinates.find({elm});
          if(row) {
            dp.inset = row.inset;
            return false;
          }
        })
      }
      characteristic.coordinates.count() && characteristic.params.find_rows(({hide: false}), ({param, value}) => {
        if(!param.caption || (!param.show_calculated && param.is_calculated)) {
          return;
        }
        if(!this.params.get(param)) {
          this.params.set(param, new Set());
        }
        this.params.get(param).add(value);
      })
    });
    for(const [param, value] of this.params) {
      if(value.size === 1) {
        dp.product_params.add({param, value: Array.from(value)[0]});
      }
    }
  }

  setReady = (ready) => {
    this.setState({ready});
  };

  handleCalck = () => {
    const {dialog: {ref, cmd, _mgr}} = this.props;
    $p.ui.dialogs.alert({title, text: 'Не релизовано'});
    this.handleCancel();
  }

  handleCancel = () => {
    this.props.handlers.handleIfaceState({
      component: 'DataObjPage',
      name: 'dialog',
      value: null,
    });
  }

  render() {
    const {state: {ready}, dp, obj} = this;
    return <Dialog
      open
      initFullScreen
      large
      title={title}
      onClose={this.handleCancel}
      actions={[
        <Button
          key="ok"
          disabled={!ready}
          onClick={this.handleCalck}
          variant="contained"
          color="primary"
        >Выполнить</Button>,
        <Button key="cancel" onClick={this.handleCancel} color="primary">Отмена</Button>
      ]}
    >
      <Stepper setReady={this.setReady} dp={dp} obj={obj}/>
    </Dialog>;
  }
}

export default ChangeRecalc;
