/**
 *
 *
 * @module Progress
 *
 * Created by Evgeniy Malyarov on 27.09.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ListItemText from '@material-ui/core/ListItemText';
import LinearProgress from '@material-ui/core/LinearProgress';

import withStyles from '@material-ui/core/styles/withStyles';

const styles = (theme) => ({
  bottom: {
    marginBottom: theme.spacing.unit * 2,
  },
  noPadding: {
    padding: 0,
  }
});

class Progress extends Component {

  render() {
    const {
      status: {nom, characteristic, progress, rows, workpieces, products_len, workpieces_len, scraps_percent, scraps_len, userData: {usefulscrap}},
      classes,
    } = this.props;
    const completed = progress * 100;
    const buffer = completed + Math.random() * 6;


    return <div className={classes.bottom}>
      <ListItemText primary={`${nom.name}${characteristic.empty() ? '' : ' ' + characteristic.name}`}/>
      <LinearProgress color="secondary" variant="buffer" value={completed} valueBuffer={buffer}/>
      <ListItemText
        secondary={`${(products_len / 1000).toFixed(1)}м, ${rows.length}шт, Заготовок: ${
          (workpieces_len / 1000).toFixed(1)}м, ${workpieces.length}шт, Обрезь: ${
          (scraps_len / 1000).toFixed(1)}м, ${workpieces.reduce((sum, val) => val > usefulscrap ? sum + 1 : sum, 0)}шт, Отходы: ${
          ((workpieces_len - products_len - scraps_len) / 1000).toFixed(1)}м, ${scraps_percent.toFixed(1)}%`}
        className={classes.noPadding}
      />
    </div>;
  }
}

Progress.propTypes = {
  status: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Progress);
