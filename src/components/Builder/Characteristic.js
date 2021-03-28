
import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'metadata-react/App/Dialog';
import FrmObj from 'wb-forms/dist/CatCharacteristics/FrmObj';

export default function Characteristic({editor, handleClose, windowHeight}) {

  const {_dp} = editor.project;
  const {_manager, ref, name} = _dp.characteristic;

  return <Dialog
    open
    noSpace
    title={name}
    onClose={handleClose}
    initFullScreen
  >
    <FrmObj
      _mgr={_manager}
      _acl="r"
      match={{params: {ref}}}
      handlers={{}}
      windowHeight={windowHeight}
    />
  </Dialog>;
}

Characteristic.propTypes = {
  handleClose: PropTypes.func,
  editor: PropTypes.object,
  windowHeight: PropTypes.number,
};
