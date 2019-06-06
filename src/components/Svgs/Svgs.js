/**
 * ### Галлерея эскизов изделий текущего заказа
 *
 * @module Svgs
 *
 * Created by Evgeniy Malyarov on 14.05.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import {withStyles} from '@material-ui/styles';
import cn from 'classnames';

const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    paddingTop: 2,
    //overflow: 'auto',
    maxHeight: 180,
  },
  fab: {
    position: 'absolute',
    top: theme.spacing(),
    right: theme.spacing(2),
  },
});

class Svgs extends React.Component {

  state = {selected: ''};

  render() {
    const {classes, hidden, height, reverseHide, handleNavigate, imgs} = this.props;
    const {selected} = this.state;
    return <div className={classes.root} style={{minHeight: height}}>
      <Fab
        size="small"
        className={classes.fab}
        onClick={reverseHide}
        style={{top: hidden ? -16 : 0}}
        title={hidden ? 'Показать эскизы' : 'Скрыть эскизы'}
      >
        {hidden ? <UpIcon /> : <DownIcon />}
      </Fab>
      {!hidden && imgs.map(({ref, svg}) => {
        const ondblclick = () => handleNavigate(`/builder/${ref}`);
        return <div
          key={ref}
          className={cn({rsvg_elm: true, rsvg_selected: ref === selected})}
          ref={(el) => {
            if(el) {
              el.innerHTML = $p.iface.scale_svg(svg, 88, 22);
              el.firstChild.ondblclick = ondblclick;
            }
          }}
          onClick={() => this.setState({selected: ref})}
          onDoubleClick={ondblclick}
        />;
      })}
    </div>;
  }
}

Svgs.propTypes = {
  classes: PropTypes.object,
  height: PropTypes.number,
  hidden: PropTypes.bool,
  reverseHide: PropTypes.func,
  handleNavigate: PropTypes.func,
  imgs: PropTypes.array,
};

export default withStyles(styles, { withTheme: true })(Svgs);
