/**
 * ### Карточка покупателя
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 14.03.2018.
 */

import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  search: {
    minWidth: 280,
  },
  left: {
    paddingLeft: 0,
  },
  bar: {

  },
  secondary: {
    marginTop: -theme.spacing.unit * 1.5,
  },
  groupTitle: {
    fontWeight: 'bold',
  },
  listitem: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  }
});

export default withStyles(styles);
