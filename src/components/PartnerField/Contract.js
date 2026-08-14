import React from 'react';
import Button from '@material-ui/core/Button';
import RefField from 'metadata-react/DataField/PropField';
import FieldNumber from 'metadata-react/DataField/FieldNumberNative';
import FieldText from 'metadata-react/DataField/FieldText';
import FieldDate from 'metadata-react/DataField/FieldDate';
import {handleSubmit} from './data';

import {prepayment_meta} from './DialogCreate';

const manager_meta = {
  type: {
    is_ref:true,
    types: ['cat.users'],
  },
  get tooltip() {
    return this.synonym;
  },
  synonym: 'Основной менеджер',
}


export function Actions({obj, o, kind, mode, handleOk, on_select}) {

  const [modified, setModified] = React.useState(o._modified);
  React.useEffect(() => {
    function update(o, f) {
      setModified(true);
    }
    o._manager.on({update});
    return () => o._manager.off({update});
  }, [o]);

  return <>
    <Button onClick={handleOk}>{mode === 'edit' ? 'Закрыть' : 'Отмена'}</Button>
    <Button disabled={!modified}
      onClick={() => {
      handleOk();
      const {dialogs} = $p.ui;
      // если существует договор по ключу - отказ
      if(kind === '0' && o._manager.find_rows({
        owner: o.owner,
        organization: o.organization,
        department: o.department,
        name: o.name,
      }).length > 1) {
        return dialogs.alert({
          title: 'Дубликат договора',
          text: `Уже существует договор по ключу
            Контрагент+Организация+Подразделение+Номер`,
        });
      }
      const raw = o.toJSON();
      handleSubmit({obj, mode: 'contract', ...raw, partner: raw.owner, on_select});
    }}>{mode === 'edit' ? 'Записать' : 'Создать'}</Button>
  </>;
}

export function Contract({o, kind}) {

  const {buyer_main_manager: property} = $p.job_prm.properties;
  const main_manager_row = property && (o.extra_fields.find({property}) || o.extra_fields.add({property}));

  return <div style={{maxWidth: 800}}>
    <RefField _obj={o} _fld="owner" read_only />
    <RefField _obj={o} _fld="organization" read_only />
    <RefField _obj={o} _fld="department" read_only />
    {kind === '0' && <RefField _obj={o} _fld="parent" read_only />}
    <RefField
      _obj={o}
      _fld="prepayment_percent"
      _meta={prepayment_meta}
      Component={FieldNumber}
      handleValueChange={(v) => {
        if(v < 60) {
          o.prepayment_percent = 60;
        }
        else if(v > 100) {
          o.prepayment_percent = 100;
        }
      }}
    />
    {kind !== '0' && <>
      <RefField _obj={o} _fld="number_doc" Component={FieldText}  />
      <RefField _obj={o} _fld="date" Component={FieldDate} />
    </>}
    <RefField _obj={o} _fld="confederate" hide_open />
    {main_manager_row && <RefField _obj={main_manager_row} _meta={manager_meta} _fld="value" hide_open />}
    <RefField _obj={o} _fld="name" Component={FieldText} read_only={kind === '0'} />
    <RefField _obj={o} _fld="note" Component={FieldText} />
  </div>;
}
