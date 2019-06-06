/**
 * ### Карточка покупателя
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 14.03.2018.
 */

import {withStyles} from '@material-ui/styles';

const styles = theme => ({
  entered: {
    minHeight: 120,
  },
  secondary: {
    marginTop: -theme.spacing(1.5),
  },
  groupTitle: {
    fontWeight: 'bold',
  },
  listitem: {
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
  }
});

export default withStyles(styles);
