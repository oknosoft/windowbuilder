import React from 'react';
import {Resize, ResizeHorizon} from 'metadata-react/Resize';
import TabularSection from 'metadata-react/TabularSection';
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';
import Additions2DSvg from './Additions2DSvg';
import Additions2DBtn from './Additions2DBtn';

const {doc: {work_centers_task}, enm: {debit_credit_kinds: {debit}}} = $p;
export const _meta = work_centers_task.metadata('cuts');
const filter = (collection) => {
  const res = [];
  collection.find_rows({record_kind: debit}, (row) => {
    res.push(row);
  });
  return res;
};

export default function Additions2DCutsIn({obj, div}) {

  const {clientHeight, clientWidth} = div;
  const resize = () => {

  };

  const [loading, setBackdrop] = React.useState(false);

  const [row, setRow] = React.useState(null);
  const selectedRowsChange = ({rowIdx}) => {
    const rows = filter(obj.cuts);
    setRow(rows[rowIdx]);
  };

  return  <Resize handleWidth="6px" onResizeStop={resize}  onResizeWindow={resize}>
    <ResizeHorizon width={`${(clientWidth * 8/12).toFixed()}px`} minWidth="300px">
      <LoadingModal open={loading} text="Оптимизация на сервере" />
      <TabularSection
        _obj={obj}
        _meta={_meta}
        _tabular="cuts"
        filter={filter}
        disable_cache
        minHeight={clientHeight - 50}
        denyReorder
        onCellSelected={selectedRowsChange}
        btns={<Additions2DBtn obj={obj} setBackdrop={setBackdrop}/>}
      />
    </ResizeHorizon>
    <ResizeHorizon overflow="hidden auto" width={`${(clientWidth * 4/12).toFixed()}px`} minWidth="200px">
      <Additions2DSvg row={row} height={clientHeight}/>
    </ResizeHorizon>
  </Resize>;
}
