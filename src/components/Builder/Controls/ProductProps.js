
import React from 'react';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';

export default function ProductProps({_dp, ox}) {
  const {blank} = $p.utils;
  return <>
    <PropField fullWidth _obj={_dp} _fld="sys"/>
    <PropField fullWidth _obj={_dp} _fld="clr"/>
    <LinkedProps ts={ox.params} cnstr={0} inset={blank.guid}/>
  </>;
}
