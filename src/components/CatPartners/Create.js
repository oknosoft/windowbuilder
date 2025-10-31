import React from 'react';
import Dialog from 'metadata-ui/App/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import RefField from 'metadata-ui/DataField/RefField';

export default function DialogCreate({raw, obj, fld, handleClose, handleSubmit}) {
  const {value, data: {inn, ogrn, ogrn_date, address}} = raw[0];
  return <Dialog
    open
    fullWidth
    maxWidth="md"
    onClose={handleClose}
    title="Контрагент по ИНН"
    actions={<>
      <Button onClick={handleClose}>Отмена</Button>
      <Button onClick={handleSubmit}>Создать</Button>
    </>}
  >
    <DialogContentText>{`Создать контрагента '${value}'?`}</DialogContentText>
    <DialogContentText>{`ИНН: ${inn}`}</DialogContentText>
    <DialogContentText>{`ОГРН: ${ogrn} от ${new Date(ogrn_date).toLocaleDateString()}`}</DialogContentText>
    <DialogContentText>{`Адрес: ${address?.unrestricted_value}`}</DialogContentText>
    {obj? <>
      <hr/>
      <DialogContentText>{`Уточните организацию для основного договора`}</DialogContentText>
      <RefField obj={obj} fld={fld || "organization"} />
    </> : null}
  </Dialog>;
}
