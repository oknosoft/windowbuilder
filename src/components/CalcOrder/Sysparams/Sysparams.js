/**
 * ТАбчасть разрешенных Систем
 */

import React, {
  Component
} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import TabularSection from 'metadata-react/TabularSection';
import connect from './connect';

class Sysparams extends Component {

  constructor(props, context) {
    super(props, context);
    const {
      handleCancel,
      handleCalck,
      dialog: {
        ref,
        _mgr
      }
    } = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);



    // this.scheme = {
    //   tabular_sections: {
    //     systems: {
    //
    //       "fields": ["sys"],
    //       "aligns": "center",
    //       "sortings": "na",
    //       "types": "ref",
    //       "headers": "Система",
    //       "widths": "*",
    //       "min_widths": "200"
    //     }
    //   }
    // };


    this.obj = _mgr.by_ref[ref];
    // const meta = this.meta = _mgr.metadata().form.systems;
    const dp = $p.dp.buyers_order.create();
    // const  cm = new  this.obj.production.constructor("system",this.obj)


    const row_data = this.obj.extra_fields.find({
      property: $p.cch.properties.predefined("permitted_sys")
    })._obj.txt_row.split(',');

    const set_data = new Set(row_data);
    set_data.forEach((sys) => {
      if (sys !== ""

      ) {
        dp.sys_profile.add({
          sys
        });

      }

    });



    this.state = {
      _obj: dp,
      msg: null
    };

  }

  handleOk = () => {
    const {
      obj,
    } = this;
    var tt = "";

    const {
      _obj
    } = this.state._obj.sys_profile;
    _obj.forEach((row, item) => {
      if (item !== _obj.length - 1) {

        tt += row.sys + ",";
      } else {
        tt += row.sys;

      }

    });
    tt;
    obj._extra('permitted_sys', tt);
    obj.extra_fields.find({
      property: $p.cch.properties.predefined("permitted_sys")
    })._obj.txt_row = tt;


    this.handleCancel();
  };

  handleErrClose = () => {
    this.setState({
      msg: null
    });
  };

  handleValueChange(_fld) {
    return (event, value) => {
      const {
        state: {
          _obj
        }
      } = this;
      //const old_value = _obj[_fld];
      _obj[_fld] = (value || (event && event.target ? event.target.value : ''));
      this.forceUpdate();
    };
  }

  render() {

    const {
      handleCancel,
      handleOk,
      handleErrClose,

      state: {
        _obj,
        msg
      }
    } = this;

    return <Dialog
    open
    initFullScreen
    large
    title = 'Разрешенные системы'
    onClose = {
      handleCancel
    }
    actions = {
      [ <
        Button key = 'ok'
        onClick = {
          handleOk
        }
        color = 'primary' > Записать и закрыть < /Button>, <
        Button key = 'cancel'
        onClick = {
          handleCancel
        }
        color = 'primary' > Закрыть < /Button>
      ]
    } >
    {
      <
      TabularSection key = 'system'
      _obj = {
        _obj
      }

      _tabular = 'sys_profile' / >
    }

    {
      msg && < Dialog
      open
      title = {
        msg.title
      }
      onClose = {
        handleErrClose
      }
      actions = {
          [ <
            Button key = 'ok'
            onClick = {
              handleErrClose
            }
            color = 'primary' > Ок < /Button>,
          ]
        } > {
          msg.text || msg
        } <
        /Dialog>} < /
      Dialog >;

    }
  }

  Sysparams.propTypes = {
    dialog: PropTypes.object.isRequired,
    handlers: PropTypes.object.isRequired,
    handleCalck: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
  };

  export default connect(Sysparams);
