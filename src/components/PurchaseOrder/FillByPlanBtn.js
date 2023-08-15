
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ListAltIcon from '@material-ui/icons/ListAlt';
import FillByPlan from './FillByPlan';


export default function FillByPlanBtn({_obj}) {
  const [open, rawSetOpen] = React.useState(false);
  const setClose = () => rawSetOpen(false);
  const setOpen = () => {
    if(_obj.posted) {
      return $p.ui.dialogs.alert({
        title: 'Документ проведён',
        text: 'Для продолжения операции, отмените проведение документа'
      });
    }
    if(_obj.goods.count()) {
      return $p.ui.dialogs.alert({
        title: 'Строки в табчасти',
        text: 'Для продолжения операции, удалите строки из табчасти'
      });
    }
    rawSetOpen(true);
  };

  return <>
    <IconButton disabled>|</IconButton>
    <IconButton title="Заполнить остатками потребности" onClick={setOpen}><ListAltIcon/></IconButton>
    <FillByPlan open={open} setClose={setClose} _obj={_obj}/>
  </>;
}
