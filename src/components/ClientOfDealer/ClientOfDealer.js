/**
 * ### Карточка покупателя
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import {renderItems} from 'metadata-react/FrmObj/DataObj';
import connect from './connect';

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
    const {utils} = $p;
    for (const fld of fields) {
      this.fake_obj.__define(fld, {
        get() {
          return utils.fetch_type(data[fields.indexOf(fld)], meta.fields[fld]);
        },
        set(v) {
          data[fields.indexOf(fld)] = v;
        }
      });
    }

    this.state = {
      _obj: this.fake_obj,
      _meta: meta,
      msg: null
    };

  }

  handleOk = () => {
    const {data, obj, meta, fake_obj, props: {dialog}} = this;

    // если не указаны обязательные реквизиты
    const struct = {
      items: meta.obj.items.find((v) => v.cond_value === fake_obj.individual_legal),
      has(fld, items) {
        if(!items) {
          items = this.items;
        }
        if(!items) {
          return true;
        }
        if(items.items) {
          items = items.items;
        }
        return items.some((v) => {
          if(v.fld === fld) {
            return true;
          }
          if(v.items) {
            return this.has(fld, v.items);
          }
        });
      }
    };
    for (var mf in meta.fields){
      if (meta.fields[mf].mandatory && !fake_obj[mf] && struct.has(mf)) {
        this.setState({msg: {
          title: $p.msg.mandatory_title,
          text: $p.msg.mandatory_field.replace("%1", meta.fields[mf].synonym)
        }});
        return;
      }
    }

    obj[dialog.cmd] = data.join('\u00A0');
    this.handleCancel();
  };

  handleErrClose = () => {
    this.setState({msg: null});
  };

  handleValueChange(_fld) {
    return (event, value) => {
      const {state: {_obj}} = this;
      //const old_value = _obj[_fld];
      _obj[_fld] = (value || (event && event.target ? event.target.value : ''));
      this.forceUpdate();
    };
  }

  render() {

    const {handleCancel, handleOk, handleErrClose, meta, state: {msg}} = this;

    return <Dialog
      open
      initFullScreen
      large
      title="Реквизиты клиента"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Записать и закрыть</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      {renderItems.call(this, meta.obj.items)}
      {msg && <Dialog
        open
        title={msg.title}
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleErrClose} color="primary">Ок</Button>,
        ]}
      >
        {msg.text || msg}
      </Dialog>}
    </Dialog>;

  }
}

ClientOfDealer.propTypes = {
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(ClientOfDealer);
