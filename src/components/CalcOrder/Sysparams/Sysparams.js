/**
 * ТАбчасть разрешенных Систем
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import TabularSection from 'metadata-react/TabularSection';
import connect from './connect';

class Sysparams extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck, dialog: {ref, _mgr}} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);

    $p.cat.scheme_settings.find_rows({obj: 'dp.buyers_order.sys_profile'}, (scheme) => {
      if(scheme.name.endsWith('main')) {
        this.scheme = scheme;
      }
    });

    this.obj = _mgr.by_ref[ref];
    const dp = $p.dp.buyers_order.create();

    const property = $p.cch.properties.predefined('permitted_sys');
    const prow = this.obj.extra_fields.find({property});
    const set_data = new Set(prow ? prow.txt_row.split(',') : []);
    set_data.forEach((sys) => {
      sys && dp.sys_profile.add({sys});
    });

    this.state = {_obj: dp, msg: null};

  }

  handleOk = () => {
    const {obj, state} = this;
    let txt_row = '';

    state._obj.sys_profile.forEach(({sys}) => {
      if(txt_row) {
        txt_row += ',';
      }
      txt_row += sys.ref;
    });

    obj._extra('permitted_sys', txt_row.split(',')[0]);
    obj.extra_fields.find({property: $p.cch.properties.predefined('permitted_sys')}).txt_row = txt_row;

    this.handleCancel();
  };

  handleValueChange(_fld) {
    return (event, value) => {
      const {_obj} = this.state;
      _obj[_fld] = (value || (event && event.target ? event.target.value : ''));
      this.forceUpdate();
    };
  }

  render() {

    const {handleCancel, handleOk, state: {_obj}, scheme} = this;

    return <Dialog
      open
      initFullScreen
      large
      title = 'Разрешенные системы'
      onClose = {handleCancel}
      actions = {[
        <Button key='ok' onClick={handleOk} color='primary'> Записать и закрыть </Button>,
        <Button key='cancel'onClick={handleCancel}color='primary'> Закрыть </Button>
      ]}
    >
      <TabularSection key='system' _obj={_obj} _tabular='sys_profile' scheme={scheme}/>
    </Dialog>;
  }
}

Sysparams.propTypes = {
  dialog: PropTypes.object,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(Sysparams);

