import React from 'react';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import RefField from 'metadata-react/DataField/PropField';
import {handleSubmit} from './data';

export default function DialogCreate(props) {
  const {raw, obj, fld, handleOk, handleClose} = props;
  const {value, data: {inn, ogrn, ogrn_date, address}} = raw[0];
  return <>
    <DialogContentText>{`Создать контрагента '${value}'?`}</DialogContentText>
    <DialogContentText>{`ИНН: ${inn}`}</DialogContentText>
    <DialogContentText>{`ОГРН: ${ogrn} от ${new Date(ogrn_date).toLocaleDateString()}`}</DialogContentText>
    <DialogContentText>{`Адрес: ${address?.unrestricted_value}`}</DialogContentText>
    {obj? <>
      <hr/>
      <DialogContentText>{`Уточните организацию и подразделение для основного договора`}</DialogContentText>
      <RefField _obj={obj} _fld="organization" />
      <RefField _obj={obj} _fld="department" />
    </> : null}
    <div style={{display: 'flex'}}>
      <span style={{flex: 1}}></span>
      <Button onClick={handleOk}>Отмена</Button>
      <Button onClick={() => {
        handleOk();
        handleSubmit({obj, raw: raw[0]});
      }}>Создать</Button>
    </div>
  </>;
}
