
import React from 'react';
import SelectOrder from './SelectOrder';
import SelectFigure from 'wb-forms/dist/CalcOrder/Templates/SelectFigure';
//import SelectSys from 'wb-forms/dist/CalcOrder/Templates/SelectSys';

export const steps = ['Выбор системы и группы форм', 'Выбор формы изделия', /*'Уточнить систему', 'Уточнить шаблон' */];

export function stepContent(step, props) {
  switch (step) {
  case 0:
    return <SelectOrder {...props}/>;
  case 1:
    return <SelectFigure {...props}/>;
  // case 2:
  //   return <SelectSys {...props}/>;
  default:
    return 'Unknown step';
  }
}
