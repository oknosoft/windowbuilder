import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import LayersIcon from '@material-ui/icons/Layers';
import {debit, credit} from './Additions2DCutsOut';
import {ToolbarMenu} from './ToolbarMenu';

const {adapters: {pouch}, ui: {dialogs}, utils, enm: {debit_credit_kinds}, EditorInvisible} = $p;

const attr = {
  path: {
    strokeColor: 'grey',
    strokeWidth: 1,
    strokeScaling: false,
  },
  cut: {
    strokeColor: 'blue',
    strokeWidth: 1,
    strokeScaling: false,
    dashArray: [6, 8],
  },
  bounds: {
    strokeColor: 'green',
    strokeWidth: 1,
    strokeScaling: false,
    dashArray: [3, 4],
  },
  fontSize: 70,
}

function getSvg(options) {

  const {_scope: {document}, activeLayer: {bounds}} = this;
  const svg = this.exportSVG({
    precision: 1,
    onExport: (item, node) => {
      if (item._class === 'PointText') {
        node.textContent = null;
        for (let i = 0; i < item._lines.length; i++) {
          let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.textContent = `\u200b${item._lines[i]}`;
          let dy = item.leading;
          if (i === 0) {
            dy = 0;
          }
          tspan.setAttributeNS(null, 'x', node.getAttribute('x'));
          tspan.setAttributeNS(null, 'dy', dy);
          node.appendChild(tspan);
        }
      }
      return node;
    }
  });

  svg.setAttribute('x', bounds.x.round() - 40);
  svg.setAttribute('y', bounds.y.round() - 20);
  svg.setAttribute('width', bounds.width.round() + 80);
  svg.setAttribute('height', bounds.height.round() + 40);
  svg.querySelector('g').removeAttribute('transform');

  return options?.scale ? utils.scale_svg(svg.outerHTML, options.scale.size, options.scale.padding) : svg.outerHTML;
}

function run2D(obj, setBackdrop, row, mode) {
  if(mode !== 'all' && !row) {
    return dialogs.alert({
      title: 'Раскрой 2D',
      text: 'Укажите строку изделия или обрези',
    });
  }
  setBackdrop(true);
  let res = Promise.resolve();
  const errors = new Map();
  for(const [nom, params] of obj.fragments2D(mode !== 'all' && row.nom, mode === 'currentScrap' && row)) {
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
          },
          status: 400,
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
      // http://localhost:3707
      return pouch.fetch('/adm/api/cut', {
        method: 'POST',
        headers: new Headers({
          Accept: 'multipart/related; type=text/plain',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(params),
      });
    })
      .then(async (res) => {
        const {body, headers, status, statusText} = res;
        const contentType = headers?.get('content-type');
        if (status > 200 || contentType.includes('application/json')) {
          return res.json();
        }
        const boundary = contentType.split('boundary=')[1];
        let chunks = '';
        const stream = body.pipeThrough(new TextDecoderStream('utf-8', {fatal: true}));
        const reader = stream.getReader();
        for (;;) {
          const {done, value} = await reader.read();
          if (done) {
            const data = chunks.split(`--${boundary}`)[1].split(`\r\n\r\n`)[1];
            return JSON.parse(data);
          }
          if(value.startsWith('proc:')) {
            setBackdrop(parseFloat(value.substring(5).trimEnd()));
          }
          else {
            chunks += value;
          }
        }
      })
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
  const editor = new EditorInvisible();
  const {Path, PointText, Layer} = editor;
  const project = editor.create_scheme();
  const layer = new Layer({project});
  const {scrapsIn, scrapsOut, products, options} = data;
  const dx = options?.edges?.dx || 0;
  const dy = options?.edges?.dy || 0;
  const sticks = new Set();
  const sticksMap = new Map();
  const refresh = new Set();

  for(const scrap of scrapsIn) {
    layer.removeChildren();
    const path = new Path.Rectangle(-0.5, -0.5 - dy, scrap.length + 1 + dx /2, scrap.height + 1 + dy /2);
    path.set({...attr.path, strokeWidth: 1.5});

    scrap.products = products.filter(v => v.stick === scrap.id);

    const bids = new Set();
    for(const product of scrap.products) {
      if(product.dop?.segments) {
        const {bounds, segments} = product.dop;
        if(!bids.has(bounds.id)) {
          bids.add(bounds.id);
          const path = new Path.Rectangle(
            bounds.x + dx,
            scrap.height - bounds.y - dy,
            bounds.length,
            -bounds.height
          );
          path.set(attr.bounds);
        }
        const pathAttr = {
          ...attr.path,
          segments: segments.map(([x, y]) => ({
            x: x + dx,
            y: scrap.height - y - dy,
          })),
        };
        const path = new Path(pathAttr);
        path.closePath();
        product.dop.area = path.area;
        if(product.info) {
          const center = pathAttr.segments.reduce((sum, curr) => ({
            x: sum.x + curr.x,
            y: sum.y + curr.y,
          }), {x: 0, y: 0});
          center.x /= pathAttr.segments.length;
          center.y /= pathAttr.segments.length;
          new PointText({
            point: center,
            content: product.info,
            justification: 'center',
            fontSize: attr.fontSize * 0.8,
          });
        }
      }
      else {
        const path = new Path.Rectangle(
          product.x + dx,
          scrap.height - product.y - dy,
          product.height,
          -product.length);
        path.set(attr.path);
        const {bounds} = path;
        let text = new PointText({
          content: product.height.toFixed(),
          fontSize: attr.fontSize,
        });
        text.position = bounds.bottomCenter.add([0, -text.bounds.height/2]);
        text = new PointText({
          content: product.length.toFixed(),
          rotation: -90,
          fontSize: attr.fontSize,
        });
        text.position = bounds.leftCenter.add([text.bounds.width/2 + 8, 0]);
        if(product.info) {
          text = new PointText({
            point: bounds.center,
            content: product.info,
            justification: 'center',
            fontSize: attr.fontSize * 0.8,
          });
        }
      }
    }

    let docRow = obj.cuts.find({stick: scrap.stick, record_kind: debit});
    if(!docRow) {
      throw new Error(`Нет заготовки №${scrap.stick}`);
    }
    if(sticks.has(docRow)) {
      docRow = obj.cuts.add(docRow);
      docRow.quantity = scrap.quantity;
      sticksMap.set(scrap.id, docRow.stick);
    }
    else {
      sticksMap.set(scrap.id, scrap.stick);
      refresh.add(docRow);
    }
    sticks.add(docRow);

    // обрезь
    obj.cuts.clear({stick: docRow.stick, record_kind: credit});
    scrap.scraps = scrapsOut.filter(v => v.id === scrap.id);
    for(const product of scrap.scraps) {

      const path = new Path.Rectangle(
        product.x + dx,
        scrap.height - product.y - dy,
        product.length,
        -product.height
      );
      path.set(attr.cut);
      const {bounds} = path;
      let text = new PointText({
        content: product.length.toFixed(),
        fontSize: attr.fontSize,
        fillColor: 'blue',
      });
      text.position = bounds.bottomCenter.add([0, -text.bounds.height/2]);
      text = new PointText({
        content: product.height.toFixed(),
        rotation: -90,
        fontSize: attr.fontSize,
        fillColor: 'blue',
      });
      text.position = bounds.leftCenter.add([text.bounds.width/2 + 8, 0]);

      const scrapRow = obj.cuts.add({
        stick: docRow.stick,
        record_kind: credit,
        nom: docRow.nom,
        characteristic: docRow.characteristic,
        quantity: product.quantity,
        x: product.x,
        y: product.y,
        len: product.length,
        width: product.height,
      });
    }

    docRow.dop = {svg: getSvg.call(project, options)};
  }
  for(const row of products) {
    const docRow = obj.cutting.get(row.id-1);
    if(!docRow) {
      throw new Error(`Нет отрезка №${row.id}`);
    }
    docRow.stick = sticksMap.get(row.stick);
    if(row.dop?.segments) {
      docRow.rotated = row.rotate;
      docRow.alp1 = row.dop.area;
    }
    else {
      docRow.alp1 = 0;
      if(row.length === row.height) {
        docRow.rotated = false;
      }
      else if(docRow.width === row.height && docRow.len === row.length) {
        docRow.rotated = true;
      }
      else {
        docRow.rotated = false;
      }
    }

    docRow.x = row.x;
    docRow.y = row.y;
  }

  editor.unload();
  for(const row of refresh) {
    obj._manager.emit('update', row, {indicator: true});
  }
  return utils.sleep(1000);
}

export default function Additions2DBtn({obj, setBackdrop, row, mode}) {

  const reset_sticks = (what) => {
    if(!row && (what === 'currentNom' || what === 'currentScrap')) {
      return dialogs.alert({
        title: 'Очистка данных раскроя',
        text: 'Укажите строку изделия или обрези',
      });
    }
    setBackdrop(true);
    obj._data._loading = mode === 'cuts';
    if(what === 'refill') {
      obj.cuts.clear();
      obj.fill_by_keys({c2d: true});
    }
    else {
      obj.reset_sticks('', what === 'currentNom' && row.nom, what === 'currentScrap' && row.stick);
    }
    Promise.resolve()
      .then(setBackdrop)
      .then(() => {
        if(obj._data._loading) {
          obj._data._loading = false;
          obj._manager.emit('rows', obj, {cuts: true, cutting: true});
          requestAnimationFrame(() => {
            for(const row of obj.cuts) {
              if(row.record_kind === debit_credit_kinds.debit) {
                obj._manager.emit('update', row, {indicator: true});
              }
            }
          });
        }
      });
  };

  return <>
    <ToolbarMenu
      title="Выполнить раскрой стекла"
      icon={<ViewQuiltIcon/>}
      items={[
        {text: 'Оптимизировать всё', action() {run2D(obj, setBackdrop, row, 'all')}},
        {text: 'Текущую номенклатуру', action() {run2D(obj, setBackdrop, row, 'currentNom')}},
        {text: 'Только на текущем листе', action() {run2D(obj, setBackdrop, row, 'currentScrap')}},
      ]}
    />
    <IconButton
      title="Добавить типовые заготовки"
      onClick={() => {
        setBackdrop(true);
        obj.fill_cuts();
        Promise.resolve().then(setBackdrop);
      }}
    ><LayersIcon/></IconButton>
    <ToolbarMenu
      title="Удалить данные оптимизации"
      icon={<LayersClearIcon/>}
      items={[
        {text: 'Полностью', action() {reset_sticks('all')}},
        {text: 'Текущей номенклатуры', action() {reset_sticks('currentNom')}},
        {text: 'Только на текущем листе', action() {reset_sticks('currentScrap')}},
      ]}
    />

  </>;
}
