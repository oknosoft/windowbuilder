import React from 'react';
import {withStyles} from '@material-ui/styles';
import cn from 'classnames';

const styles = theme => ({
  root: {
    minHeight: 80,
    maxHeight: 180,
    flex: 1,
  },
});

const {utils} = $p;

function Svgs({imgs, classes, currentProd, setProd}) {
  return <div className={classes.root}>
    {imgs.map((ox) => {
      const ondblclick = () => null;
      const __html = utils.scale_svg(ox.svg, 80, 22);
      return <div
        key={ox.ref}
        className={cn({rsvg_elm: true, rsvg_selected: ox == currentProd})}
        dangerouslySetInnerHTML={{__html}}
        onClick={() => setProd(ox)}
        onDoubleClick={ondblclick}
      />;
    })}
  </div>;
}

export default withStyles(styles, { withTheme: true })(Svgs)
