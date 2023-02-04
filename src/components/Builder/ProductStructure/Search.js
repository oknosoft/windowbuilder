import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import Neg1Icon from '@material-ui/icons/ExposureNeg1';
import Neg2Icon from '@material-ui/icons/ExposureNeg2';
import {useStyles} from '../Toolbar/styles';

function Search({onFilter, collaps, classes}) {
  return <Toolbar disableGutters variant="dense" className="dsn-search-box">
    <Tip title="Свернуть до первого уровня">
      <IconButton size="small" onClick={() => collaps()}><Neg1Icon/></IconButton>
    </Tip>
    <Tip title="Свернуть до второго уровня">
      <IconButton size="small" onClick={() => collaps(1)}><Neg2Icon/></IconButton>
    </Tip>
    <input type="text" className="dsn-input" placeholder="Найти..." onKeyUp={onFilter}/>
  </Toolbar>;
}

export default useStyles(Search);
