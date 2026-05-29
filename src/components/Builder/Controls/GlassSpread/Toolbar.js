import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Tip from 'metadata-react/App/Tip';
import SmallButton from '../../Toolbar/IconButton';
import FieldSelectStatic from 'metadata-react/DataField/FieldSelectStatic';
import PropField from 'metadata-react/DataField/PropField';


export default function SpreadToolbar({fake, struct, setMode, forceUpdate, handleClose}) {

  return <Toolbar disableGutters>
    <Tip title="Выбрать все">
      <SmallButton onClick={() => {
        struct.select();
        forceUpdate();
      }}>
        <CheckBoxIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Снять все">
      <SmallButton onClick={() => {
        struct.deselect();
        forceUpdate();
      }}>
        <CheckBoxOutlineBlankIcon/>
      </SmallButton>
    </Tip>
    <div style={{paddingLeft: 8, marginTop: -8, width: 360}}>
      <PropField
        _obj={fake}
        _fld="value"
        _meta={fake.meta}
        options={fake.list}
        handleValueChange={setMode}
        Component={FieldSelectStatic}
      />
    </div>
    <span style={{flex: 1}} />
    <Button onClick={() => struct.apply(handleClose)}>Выполнить</Button>
  </Toolbar>;
}
