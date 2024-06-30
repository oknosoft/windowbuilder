import React from 'react';
import TabularSection from 'metadata-react/TabularSection';
import {_meta} from './Additions2DCutsIn';

export const {credit} = $p.enm.debit_credit_kinds;
const filter = (collection) => {
  const res = [];
  collection.find_rows({record_kind: credit}, (row) => {
    res.push(row);
  });
  return res;
};

export default function Additions2DCutsOut({obj, div}) {

  const {clientHeight, clientWidth} = div;

  return  <TabularSection
    _obj={obj}
    _meta={_meta}
    _tabular="cuts"
    filter={filter}
    disable_cache
    minHeight={clientHeight - 50}
    denyReorder
  />;
}
