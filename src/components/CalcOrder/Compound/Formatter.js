import React from 'react';
import {get_tree, get_text} from './data';

const compound = $p.cch.properties.predefined('compound');

export default function CompoundFormatter({row}){
  const {calc_order} = row._owner._owner;
  const text = get_text(calc_order, row[compound?.ref]);
  return <div title={text}>{text}</div>;
}
