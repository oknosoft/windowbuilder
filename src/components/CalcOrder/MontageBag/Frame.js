import React from 'react';
import Production from './Production';
import Materials from './Materials';

const {cat: nom, job_prm} = $p;
const [product, ...predefined] = job_prm.nom.montage_bag;

function MontageBag({obj, wnd}) {

  const [prodRow, setProdRow] = React.useState(null);

  return <>
    <Production obj={obj} prodRow={prodRow} setProdRow={setProdRow} product={product}/>
    <Materials prodRow={prodRow} predefined={predefined}/>
  </>;
}

export default MontageBag;
