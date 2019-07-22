/**
 * ### Форма редактирования параметрических изделий
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import Frame from '../CalcOrderAdditions/Frame';
import Production from './Production';
import Params from './Params';
import Additions from './Additions';

export default function Parametric(props) {
  return <Frame Content={Additions} title="Параметрические изделия" {...props} />;
};
