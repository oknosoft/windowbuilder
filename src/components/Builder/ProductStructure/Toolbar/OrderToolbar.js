import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles';

function OrderToolbar({order, set_order, classes, editor}) {

  const handleChange = (event, newOrder) => {
    if(newOrder === 'frm') {
      const {ox} = editor.project;
      return $p.ui.dialogs.handleNavigate(`/order/${ox.calc_order.ref}?ref=${ox.ref}`);
    }
    set_order(newOrder);
  };

  return <Toolbar disableGutters variant="dense">
    <ToggleButtonGroup size="small" value={order} exclusive onChange={handleChange}>
      <ToggleButton value="prod" classes={{root: classes.toggleBtn}}>
        <Tip title="Все изделия заказа">
          <i className="fa fa-object-ungroup fa-fw"/>
        </Tip>
      </ToggleButton>
      <ToggleButton value="nom" classes={{root: classes.toggleBtn}}>
        <Tip title="Материалы и услуги">
          <i className="fa fa-cube fa-fw"/>
        </Tip>
      </ToggleButton>
      <ToggleButton value="frm" classes={{root: classes.toggleBtn}}>
        <Tip title="Заказ в отдельной форме">
          <i className="fa fa-external-link fa-fw"/>
        </Tip>
      </ToggleButton>
    </ToggleButtonGroup>
    <div className={classes.title} />
  </Toolbar>;
}

export default useStyles(OrderToolbar);
