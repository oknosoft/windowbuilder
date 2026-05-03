import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import LayersIcon from '@material-ui/icons/Layers';
import {debit, credit} from './Additions2DCutsOut';

const {adapters: {pouch}, ui: {dialogs}, utils} = $p;

function run2D(obj, setBackdrop) {
  setBackdrop(true);
  let res = Promise.resolve();
  const errors = new Map();
  for(const [nom, params] of obj.fragments2D()) {
    const record = (msg) => {
      if(!errors.has(nom)) {
        errors.set(nom, []);
      }
      errors.get(nom).push(msg);
    };
    res = res.then(() => {
      if(!params.products.length || !params.scraps.length) {
        record('В задании нет изделий или заготовок для раскроя 2D');
        return {
          json() {
            return {
              scrapsIn: [],
              scrapsOut: [],
              products: [],
            };
          }
        };
      }
      if(!params.options) {
        params.options = {};
      }
      // if(!params.options.edges) {
      //   const edgeBottom = nom._extra('edgeBottom');
      //   const edgeTop = nom._extra('edgeTop');
      //   const edgeLeft = nom._extra('edgeLeft');
      //   const edgeRight = nom._extra('edgeRight');
      //   params.options.edges = {dx: edgeLeft || edgeRight || 15, dy: edgeTop || edgeBottom || 15};
      // }
      return pouch.fetch('/adm/api/cut', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    })
      .then((res) => res.json())
      .then((data) => setSticks({obj, data, record}));
  }
  return res
    .then(() => {
      setBackdrop(false);
      if(errors.size) {
        dialogs.alert({
          title: 'Ошибки раскроя',
          text: Array.from(errors)
            .map(([nom, errors], index) => <div key={index}>
              <Typography variant="h6">{nom.name}</Typography>
              {errors.map((err, ierr) => <Typography key={ierr}>{err}</Typography>)}
            </div>),
        });
      }
    })
    .catch((err) => {
      setBackdrop(false);
      dialogs.alert({
        title: 'Ошибки раскроя',
        text: err?.message || err,
      });
    });
}

function setSticks({obj, data, record}) {
  if(data.error) {
    return record(data.message);
  }
  const sticks = new Set();
  const sticksMap = new Map();
  const refresh = new Set();
  for(const row of data.scrapsIn) {
    let docRow = obj.cuts.find({stick: row.stick, record_kind: debit});
    if(!docRow) {
      throw new Error(`Нет заготовки №${row.stick}`);
    }
    if(sticks.has(docRow)) {
      docRow = obj.cuts.add(docRow);
      docRow.quantity = row.quantity;
      sticksMap.set(row.id, docRow.stick);
    }
    else {
      sticksMap.set(row.id, row.stick);
      refresh.add(docRow);
    }
    sticks.add(docRow);
    docRow.dop = {svg: row.svg};
    // обрезь
    obj.cuts.clear({stick: docRow.stick, record_kind: credit});
    for(const scrap of row.scraps) {
      const scrapRow = obj.cuts.add({
        stick: docRow.stick,
        record_kind: credit,
        nom: docRow.nom,
        characteristic: docRow.characteristic,
        quantity: row.quantity,
        x: scrap.x,
        y: scrap.y,
        len: scrap.length,
        width: scrap.height,
      });
    }
  }
  for(const row of data.products) {
    const docRow = obj.cutting.get(row.id-1);
    if(!docRow) {
      throw new Error(`Нет отрезка №${row.id}`);
    }
    docRow.stick = sticksMap.get(row.stick);
    if(row.length === row.height) {
      docRow.rotated = false;
    }
    else if(docRow.width === row.height && docRow.len === row.length) {
      docRow.rotated = true;
    }
    else {
      docRow.rotated = false;
    }

    docRow.x = row.x;
    docRow.y = row.y;
  }
  for(const row of refresh) {
    obj._manager.emit('update', row, {indicator: true});
  }
  return utils.sleep(1000);
}

export default function Additions2DBtn({obj, setBackdrop}) {
  return <>
    <IconButton
      title="Выполнить раскрой стекла"
      onClick={() => run2D(obj, setBackdrop)}
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
