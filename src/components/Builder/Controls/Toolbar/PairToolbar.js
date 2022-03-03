import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '../../Toolbar/IconButton';
import Tip from 'metadata-react/App/Tip';
import {useStyles} from '../../Toolbar/styles';

function PairToolbar({editor, current, classes}) {
  return <Toolbar disableGutters>
    Пара элементов
  </Toolbar>;
}

PairToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default useStyles(PairToolbar);
