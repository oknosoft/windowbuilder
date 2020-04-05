/**
 * ### Карточка покупателя
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 14.03.2018.
 */

import {withStyles} from '@material-ui/styles';

const styles = theme => ({
  root: {
    width: '80vw',
    marginLeft: 'auto',
    marginRight: 'auto',
    '@media print': {
      width: '190mm',
      backgroundColor: theme.palette.common.white
    },
    '& td': {
      padding: theme.spacing() / 2,
      border: '1px solid rgba(224, 224, 224, 1)'
    },
  },
  row: {
    height: 'inherit',
  },
  nom: {
    marginTop: theme.spacing(2),
  },
  data: {
    marginBottom: theme.spacing(2),
  },
  canvas: {
    width: '100%',
  }
});

export default withStyles(styles);
