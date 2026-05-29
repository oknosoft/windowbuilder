// дерево выбора цепочки

import React from 'react';
import {decorators, Treebeard} from 'wb-forms/dist/Treebeard';

export default function SpreadTreebeard ({data, forceUpdate, onToggle}) {

  return <Treebeard
    data={data}
    decorators={decorators}
    separateToggleEvent={true}
    onToggle={onToggle}
    onClickHeader={forceUpdate}
  />
}
