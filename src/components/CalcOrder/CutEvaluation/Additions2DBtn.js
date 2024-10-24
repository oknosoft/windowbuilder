import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import LayersIcon from '@material-ui/icons/Layers';
import {credit} from './Additions2DCutsOut';

const {adapters: {pouch}, ui: {dialogs}} = $p;

function run2D(obj, setBackdrop) {
  //obj.reset_sticks('2D');
  return () => Promise.resolve(obj.fragments2D())
    .then((params) => {
      if(!params.products.length || !params.scraps.length) {
        throw new Error('В задании нет изделий или заготовок для раскроя 2D');
      }
      setBackdrop(true);
      return pouch.fetch('/adm/api/cut', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    })
    .then((res) => res.json())
    .then((data) => setSticks(obj, data))
    .then(() => setBackdrop(false))
    .catch((err) => {
      setBackdrop(false);
      dialogs.alert({
        title: 'Раскрой 2D',
        text: err?.message || err,
      });
    });
}

function setSticks(obj, data) {
  if(data.error) {
    throw data;
  }
  const sticks = new Set();
  for(const row of data.scrapsIn) {
    let docRow = obj.cuts.find({stick: row.stick});
    if(!docRow) {
      throw new Error(`Нет заготовки №${row.stick}`);
    }
    if(sticks.has(docRow)) {
      docRow = obj.cuts.add(docRow);
      docRow.stick = row.id;
      docRow.quantity = row.quantity;
    }
    sticks.add(docRow);
    docRow.dop = {svg: row.svg};
  }
  for(const row of data.scrapsOut) {
    const proto = obj.cuts.find({stick: row.id});
    const docRow = obj.cuts.add({
      record_kind: credit,
      stick: row.id,
      len: row.length,
      width: row.height,
      x: row.x,
      y: row.y,
    });
    docRow.nom = proto.nom;
    docRow.characteristic = proto.characteristic;
  }
  for(const row of data.products) {
    const docRow = obj.cutting.get(row.id-1);
    if(!docRow) {
      throw new Error(`Нет отрезка №${row.id}`);
    }
    docRow.stick = row.stick;
    docRow.rotated = row.rotate;
    docRow.x = row.x;
    docRow.y = row.y;
  }
}

export default function Additions2DBtn({obj, setBackdrop}) {
  return <>
    <IconButton
      title="Выполнить раскрой стекла"
      onClick={run2D(obj, setBackdrop)}
    ><ViewQuiltIcon/></IconButton>
    <IconButton
      title="Добавить типовые заготовки"
      onClick={() => {
        setBackdrop(true);
        obj.fill_cuts();
        Promise.resolve().then(setBackdrop);
      }}
    ><LayersIcon/></IconButton>
    <IconButton
      title="Удалить данные оптимизации раскроя"
      onClick={() => {
        setBackdrop(true);
        obj.reset_sticks();
        Promise.resolve().then(setBackdrop);
      }}
    ><LayersClearIcon/></IconButton>

  </>;
}