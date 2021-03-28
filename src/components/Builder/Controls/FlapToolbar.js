import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tip from 'wb-forms/dist/Common/Tip';
import {useStyles} from './LayersToolbar';


function FlapToolbar({editor, contour, disabled, classes}) {
  const {bounds} = contour;
  return <Toolbar disableGutters variant="dense">
    <Typography color="primary">{`${contour.layer ? "Створка" : "Рама"} №`}</Typography>
    <Typography color="secondary">{contour.cnstr}</Typography>
    <Typography color="primary" className={classes.sp}>{bounds ? '(' : ''}</Typography>
    <Typography color="secondary">{bounds ? `${bounds.width.toFixed()}x${bounds.height.toFixed()}` : ''}</Typography>
    <Typography color="primary" className={classes.title}>{bounds ? ')' : ''}</Typography>
    <Tip title={$p.msg.layer_spec}>
      <IconButton className={disabled} onClick={() => editor.fragment_spec(-contour.cnstr, contour.furn.toString())}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
    <Tip title="Обновить параметры">
      <IconButton className={disabled} onClick={() => contour.furn.refill_prm(contour)}><i className="fa fa-retweet" /></IconButton>
    </Tip>
  </Toolbar>;
}

FlapToolbar.propTypes = {
  editor: PropTypes.object,
  contour: PropTypes.object,
  disabled: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default useStyles(FlapToolbar);
