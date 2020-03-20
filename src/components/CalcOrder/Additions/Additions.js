/**
 * ### Форма добавления услуг и комплектуюущих
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import Frame from './Frame';
import AdditionsGroups from './AdditionsGroups';

export default function CalcOrderAdditions(props) {
  return <Frame Content={AdditionsGroups} title="Аксессуары и услуги" {...props} />;
}
