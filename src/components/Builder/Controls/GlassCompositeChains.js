import React from 'react';
import PropTypes from 'prop-types';
import Tip from 'metadata-react/App/Tip';
import IconButton from '@material-ui/core/IconButton';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

export default function CompositeChains({_grid, elm, set_row}) {

  const {glass_chains} = $p.job_prm.builder;

  const handleByChain = () => {

  };

  return <>
    <Tip title="Заполнить по цепочке">
      <IconButton disabled={!glass_chains || !glass_chains.length} onClick={handleByChain}><SaveAltIcon/></IconButton>
    </Tip>

  </>;
}
