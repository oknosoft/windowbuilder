/**
 * ### Карточка покупателя
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 14.03.2018.
 */

import withStyles from '@material-ui/core/styles/withStyles';

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
      padding: theme.spacing.unit / 2,
      border: '1px solid rgba(224, 224, 224, 1)'
    },
  },
  row: {
    height: 'inherit',
  },
});

export default withStyles(styles);
