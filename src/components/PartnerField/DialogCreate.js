import React from 'react';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import RefField from 'metadata-react/DataField/PropField';
import FieldNumber from 'metadata-react/DataField/FieldNumberNative';
import {handleSubmit} from './data';

export const prepayment_meta = {
  type: {
    fraction: 0,
  },
  get tooltip() {
    return this.synonym;
  },
  synonym: 'Процент предоплаты',
};

export default function DialogCreate(props) {
  const {raw, obj, fld, handleOk, handleClose} = props;
  const {value, data: {inn, ogrn, ogrn_date, address}} = raw[0];
  const prepayment = {prepayment_percent: 100};
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
      <RefField _obj={prepayment} _fld="prepayment_percent" _meta={prepayment_meta} Component={FieldNumber} />
    </> : null}
    <div style={{display: 'flex'}}>
      <span style={{flex: 1}}></span>
      <Button onClick={handleOk}>Отмена</Button>
      <Button onClick={() => {
        handleOk();
        handleSubmit({obj, raw: raw[0], ...prepayment});
      }}>Создать</Button>
    </div>
  </>;
}
