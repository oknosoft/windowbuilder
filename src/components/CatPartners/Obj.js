import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';


class PartnerObj extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck, dialog: {ref, cmd, _mgr}} = props;


    this.obj = _mgr.by_ref[ref];

    this.state = {
      msg: null
    };

  }

  handleOk = () => {

    //obj[dialog.cmd] = data.join('\u00A0');
    this.handleCancel();
  };

  handleCancel = () => {

  };

  handleCalck = (_fld) => {

  };

  render() {

    const {handleCancel, handleOk, state: {msg}} = this;

    return <Dialog
      open
      initFullScreen
      large
      title="Контрагент"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Записать и закрыть</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      Контрагент
    </Dialog>;

  }
}

export default PartnerObj;

