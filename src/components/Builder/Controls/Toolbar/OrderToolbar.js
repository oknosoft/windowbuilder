import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '../../Toolbar/IconButton';
import Typography from '@material-ui/core/Typography';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import {useStyles} from '../../Toolbar/styles';

function OrderToolbar({calc_order, classes}) {
  return <Toolbar disableGutters>
    <Typography className={classes.title} variant="subtitle2">
      {`Заказ ${calc_order.number_doc} от ${moment(calc_order.date).format('LL')}`}
    </Typography>
    {calc_order?.note &&
      <Tip title='Информация' >
        <InfoButton text={calc_order.note} />
      </Tip>
    }
  </Toolbar>;
}

OrderToolbar.propTypes = {
  calc_order: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default useStyles(OrderToolbar);
