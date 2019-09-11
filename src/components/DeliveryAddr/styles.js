/**
 * ### Карточка покупателя
 * стили оформления
 *
 * Created by Evgeniy Malyarov on 14.03.2018.
 */

import {withStyles} from '@material-ui/styles';
const {geo_map} = $p.job_prm.builder;

const styles = theme => ({
  entered: {
    minHeight: 120,
  },
  secondary: {
    marginTop: -theme.spacing(1.5),
  },
  coordinates: {
    marginTop: geo_map.includes('without_area') ? 5 : theme.spacing(),
    width: 230,
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
