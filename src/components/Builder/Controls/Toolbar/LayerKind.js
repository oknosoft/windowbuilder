/**
 * Смена типа слоя для вытягивания в отдельные изделия заказа
 * Created 23.02.2022.
 */

import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../../Toolbar/IconButton';
import Tip from 'metadata-react/App/Tip';
import ArtTrackIcon from '@material-ui/icons/ArtTrack';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';

const map = [
  {value: '0', text: 'Обычный слой'},
  {value: '1', text: 'Виртуальный слой'},
  {value: '2', text: 'Вложенное изделие'},
  {value: '3', text: 'Слой родительского изделия'},
  {value: '10', text: 'Виртуальное изделие к слою'},
  {value: '11', text: 'Виртуальное изделие к изделию'},
];
map.get = function (v) {
  const row = this.find(({value}) => value == v);
  return row?.text || '';
};
map.list = function () {
  return this.filter(({value}) => {
    const v = Number(value);
    return !v || v > 9;
  });
};

export default function LayerKind({layer}) {
  const [kind, setKind] = React.useState(layer.kind.toFixed());
  const title = map.get(kind);
  let Icon;
  let disabled = false;
  switch (layer.kind) {
  case 1:
    Icon = PhotoSizeSelectSmallIcon;
    disabled = true;
    break;

  case 2:
    Icon = DynamicFeedIcon;
    disabled = true;
    break;

  case 3:
    Icon = DynamicFeedIcon;
    disabled = true;
    break;

  case 10:
    Icon = AccountTreeIcon;
    break;

  case 11:
    Icon = AccountTreeIcon;
    break;

  default:
    Icon = ArtTrackIcon;
  }

  return <Tip title={<><b>Тип слоя:</b><br/><i>{title}</i></>}>
    <IconButton disabled={disabled} onClick={() => $p.ui.dialogs.input_value({
      title: "Тип слоя",
      list: map.list(),
      initialValue: layer.kind.toFixed()
    })
      .then((v) => {
        layer._row.kind = Number(v);
        setKind(layer.kind);
      })
    }>
      <Icon  />
    </IconButton>
  </Tip>;
}

LayerKind.propTypes = {
  layer: PropTypes.object.isRequired
};
