/**
 * ### Карточка покупателя
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog from 'metadata-react/App/Dialog';
import connect from './connect';

import {FormGroup} from 'material-ui/Form';
import DataField from 'metadata-react/DataField';

class ClientOfDealer extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck, dialog: {ref, cmd, _mgr}} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);

    this.obj = _mgr.by_ref[ref];
    const meta = this.meta = _mgr.metadata().form[cmd];
    const data = this.data = this.obj[cmd].split('\u00A0');

    // виртуальные данные
    const fields = Object.keys(meta.fields);
    this.fake_obj = {
      _metadata(fld) {
        return fld ? meta.fields[fld] : meta;
      },

      get _manager() {
        return _mgr;
      },

    };
    for (const fld of fields) {
      this.fake_obj.__define(fld, {
        get() {
          return $p.utils.fetch_type(data[fields.indexOf(fld)], meta.fields[fld]);
        },
        set(v) {
          data[fields.indexOf(fld)] = v;
        }
      });
    }
  }

  handleOk = () => {
    const {data, obj, props: {dialog}} = this;
    obj[dialog.cmd] = data.join('\u00A0');
    this.handleCancel();
  };

  renderItems(items) {
    const {fake_obj, meta} = this;

    return items.map((item, index) => {

      if(Array.isArray(item)) {
        return this.renderItems(item);
      }

      if(item.element === 'DataField') {
        return <DataField key={index} _obj={fake_obj} _fld={item.fld} _meta={meta.fields[item.fld]}/>;
      }

      if(item.element === 'FormGroup') {
        return <FormGroup key={index} row={item.row}>{this.renderItems(item.items)}</FormGroup>;
      }

      return <div key={index}>Не реализовано в текущей версии</div>;
    });
  }

  render() {

    const {handleCancel, handleOk, meta, props: {classes}} = this;

    return <Dialog
      open
      initFullScreen
      classes={{paper: classes.paper}}
      title="Реквизиты клиента"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Записать и закрыть</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      {this.renderItems(meta.obj.items)}
    </Dialog>;

  }
}

ClientOfDealer.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(ClientOfDealer);
