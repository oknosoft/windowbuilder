import React from 'react';
import PropTypes from 'prop-types';
import Tip from 'metadata-react/App/Tip';
import IconButton from '@material-ui/core/IconButton';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import GlassCompositeSelectChain from './GlassCompositeSelectChain';

export default function CompositeChains({_grid, elm, set_row}) {

  const {job_prm: {builder: {glass_chains}}, ui: {dialogs}} = $p;

  const handleByChain = () => {
    return dialogs.alert({
      title: 'Выбор цепочки',
      timeout: 0,
      Component: GlassCompositeSelectChain,
      glass_chains,
      hide_btn: true,
      noSpace: true,
      elm,
      set_row,
    });
  };

  return <>
    <Tip title="Заполнить по цепочке">
      <IconButton disabled={!glass_chains || !glass_chains.length} onClick={handleByChain}><SaveAltIcon/></IconButton>
    </Tip>

  </>;
}
