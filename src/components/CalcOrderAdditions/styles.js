/**
 * ### Форма добавления услуг и комплектуюущих
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {withStyles} from 'material-ui/styles';

const styles = theme => ({
  dialog: {
    minWidth: 800,
    maxHeight: 'calc(100vh - 100px)',
  },
  entered: {
    minHeight: 120,
  },
  secondary: {
    marginTop: -theme.spacing.unit * 1.5,
  },
  listitem: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  }
});

export default withStyles(styles);
