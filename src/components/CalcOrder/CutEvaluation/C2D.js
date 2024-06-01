
import React from 'react';
import Frame from '../Additions/Frame';
import Additions2D from './Additions2D';

export default function Parametric2D(props) {
  return <Frame
    Content={Additions2D}
    title="Раскрой"
    actions={{pre: 'Удалить обрезь', ok: 'Добавить обрезь в заказ', calck: 'Добавить обрезь в изделия'}}
    {...props}
  />;
}
