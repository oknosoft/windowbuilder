import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import {useStyles} from '../../Toolbar/styles';

function open_spec(ox) {
  const {ui: {dialogs}, cat: {characteristics}, msg} = $p;
  return dialogs.alert({
    timeout: 0,
    title: `${msg.product_spec} ${ox.prod_name(true)}`,
    Component: characteristics.SpecFragment,
    props: {_obj: ox, elm: 0},
    initFullScreen: true,
    hide_btn: true,
    noSpace: true,
  });
}

function RootToolbar({ox, _dp: {sys}, project, classes}) {
  return <Toolbar disableGutters>
    <Typography className={classes.title} variant="subtitle2">{ox.prod_name(true)}</Typography>
    <Tip title="Обновить параметры">
      <IconButton onClick={() => sys.refill_prm(ox, 0, false, project)}><i className="fa fa-retweet" /></IconButton>
    </Tip>
    <Tip title={$p.msg.layer_spec}>
      <IconButton onClick={() => open_spec(ox)}><i className="fa fa-table" /></IconButton>
    </Tip>
    {sys?.note &&
      <Tip title='Информация' >
        <InfoButton text={sys.note} />
      </Tip>
    }
  </Toolbar>;
}

RootToolbar.propTypes = {
  ox: PropTypes.object.isRequired,
  _dp: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default useStyles(RootToolbar);
