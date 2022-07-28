import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';

export default function ProdListArea(props) {
  const {_obj, _fld, cell} = props;
  const v = _obj[_fld];
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    cell.props.onBlur();
  };
  const handleOk = () => {
    setOpen(false);
    cell.props.onCommit();
  };

  return <>
    <Input
      //classes={{root: classes.iroot, input: classes.input}}
      readOnly
      value={v}
      // endAdornment={
      //   <InputAdornment
      //     position="end"
      //     //classes={{root: classes.input}}
      //   >
      //     <ArrowDropDownIcon />
      //   </InputAdornment>
      // }
    />
    <Dialog
      open={open}
      large
      title="Список продукций"
      onClose={handleClose}
      actions={[
        <Button
          key="ok"
          onClick={handleOk}
          variant="contained"
          color="primary"
        >Установить</Button>,
        <Button key="cancel" onClick={handleClose} color="primary">Отмена</Button>
      ]}
    >
      Мясо
    </Dialog>
  </>;
}
