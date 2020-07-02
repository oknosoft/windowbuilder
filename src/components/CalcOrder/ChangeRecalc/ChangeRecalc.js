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
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';
import Stepper from './Stepper';

const title = 'Пересчет с заменой параметров';

class ChangeRecalc extends React.Component {

  constructor(props, context) {
    const {ref, _mgr} = props.dialog;
    super(props, context);
    this.state = {ready: false, stamp: 0, loading: false};
    this.obj = _mgr.get(ref);
    const dp = this.dp = $p.dp.buyers_order.create();
    dp.production.load(this.obj.production);
    dp.production.forEach((row) => {
      row.use = row.characteristic.coordinates.count();
    });
    dp.value_change = function (obj, flds) {
      return this;
    }
  }

  componentDidMount() {
    this.dp._manager.on('update', this.value_change);
  }

  componentWillUnmount() {
    this.dp._manager.off('update', this.value_change);
  }

  value_change = (obj, flds) => {
    if(obj?._owner?._owner === this.dp && flds) {
      if(flds.use) {
        Object.assign(this.dp, {sys: '', clr: '', inset: ''});
        this.dp.sys_furn.clear();
      }
      if(flds.value) {
        obj._ch = true;
        this.setState({stamp: Date.now()});
      }
    }
  };

  setReady = (ready) => {
    this.setState({ready});
  };

  handleCalck = () => {
    this.setState({loading: true});
    this.obj.recalc({save: true, dp: this.dp})
      .then(this.handleCancel)
      .catch((err) => {
        this.setState({loading: false});
        $p.ui.dialogs.alert({title, text: err.message});
      });
  }

  handleCancel = () => {
    this.props.handlers.handleIfaceState({
      component: 'DataObjPage',
      name: 'dialog',
      value: null,
    });
  }

  render() {
    const {state: {ready, stamp, loading}, dp, obj} = this;
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
      <LoadingModal key="loading" open={loading} text="Пересчет изделий" />,
      <Stepper setReady={this.setReady} dp={dp} obj={obj} stamp={stamp}/>
    </Dialog>;
  }
}

ChangeRecalc.propTypes = {
  dialog: PropTypes.object,
  handlers: PropTypes.object,
};

export default ChangeRecalc;
