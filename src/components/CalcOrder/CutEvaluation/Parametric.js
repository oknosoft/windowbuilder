/**
 * ### Форма редактирования параметрических изделий
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import Frame from '../Additions/Frame';
import Additions from './Additions';

export default function Parametric(props) {
  return <Frame
    Content={Additions}
    title="Раскрой"
    actions={{pre: 'Удалить обрезь', ok: 'Добавить обрезь в заказ', calck: 'Добавить обрезь в изделия'}}
    {...props}
  />;
}
