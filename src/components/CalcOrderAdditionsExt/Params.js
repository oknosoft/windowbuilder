/**
 * ### Диалог параметров текущего изделия
 *
 * @module Params
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';

export default function Params({row, meta, props}) {
  if(!row) {
    return <Typography variant="subtitle1" color="secondary">Нет параметров, либо не выбрана строка продукции</Typography>;
  }
  return <Typography variant="subtitle1" color="primary">Есть параметры</Typography>
}
