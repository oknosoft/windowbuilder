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
    actions={{ok: 'Добавить обрезь в заказ'}}
    {...props}
  />;
}
