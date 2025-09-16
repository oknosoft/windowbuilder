import React from 'react';
import TabularSection from 'metadata-react/TabularSection';
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';
import Additions2DBtn from './Additions2DBtn';

export const _meta = $p.doc.work_centers_task.metadata('cutting');

export default function Additions2DCutting({obj, div}) {

  const {clientHeight, clientWidth} = div;
  const [loading, setBackdrop] = React.useState(false);

  return <>
    <LoadingModal open={loading} text="Оптимизация на сервере" />
    <TabularSection
      _obj={obj}
      _meta={_meta}
      _tabular="cutting"
      disable_cache
      minHeight={clientHeight - 50}
      denyReorder
      btns={<Additions2DBtn obj={obj} setBackdrop={setBackdrop}/>}
    />
  </>;
}
