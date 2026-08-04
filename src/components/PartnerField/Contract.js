import React from 'react';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import RefField from 'metadata-react/DataField/PropField';
import FieldNumber from 'metadata-react/DataField/FieldNumberNative';
import FieldText from 'metadata-react/DataField/FieldText';
import FieldDate from 'metadata-react/DataField/FieldDate';
import {handleSubmit} from './data';

import {prepayment_meta} from './DialogCreate';

export function Actions({obj, kind, mode, handleOk}) {

  return <>
    <Button onClick={handleOk}>{mode === 'edit' ? 'Закрыть' : 'Отмена'}</Button>
    <Button onClick={() => {
      handleOk();
      const {dialogs} = $p.ui;
      if(!obj._modified) {
        return dialogs.alert({
          title: 'Договор не изменён',
          text: `Запись не требуется`,
        });
      }
      // если существует договор по ключу - отказ
      if(kind === '0' && obj._manager.find_rows({
        owner: obj.owner,
        organization: obj.organization,
        department: obj.department,
        name: obj.name,
      }).length > 1) {
        return dialogs.alert({
          title: 'Дубликат договора',
          text: `Уже существует договор по ключу
            Контрагент+Организация+Подразделение+Номер`,
        });
      }
      const raw = obj.toJSON();
      handleSubmit({obj: raw, mode: 'contract', ...raw});
    }}>{mode === 'edit' ? 'Записать' : 'Создать'}</Button>
  </>;
}

export function Contract({obj, kind}) {
  return <div style={{maxWidth: 800}}>
    <RefField _obj={obj} _fld="owner" read_only />
    <RefField _obj={obj} _fld="organization" read_only />
    <RefField _obj={obj} _fld="department" read_only />
    {kind === '0' && <RefField _obj={obj} _fld="parent" read_only />}
    <RefField
      _obj={obj}
      _fld="prepayment_percent"
      _meta={prepayment_meta}
      Component={FieldNumber}
      handleValueChange={(v) => {
        if(v < 60) {
          obj.prepayment_percent = 60;
        }
        else if(v > 100) {
          obj.prepayment_percent = 100;
        }
      }}
    />
    {kind !== '0' && <>
      <RefField _obj={obj} _fld="number_doc" Component={FieldText}  />
      <RefField _obj={obj} _fld="date" Component={FieldDate}  />
    </>}
    <RefField _obj={obj} _fld="name" Component={FieldText} read_only={kind === '0'} />
    <RefField _obj={obj} _fld="note" Component={FieldText} />
  </div>;
}
