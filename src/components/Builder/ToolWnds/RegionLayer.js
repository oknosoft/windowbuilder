import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

function RegionLayer({project, layer, region}) {
  return <div>
    {`layer.info #${region}`}
    </div>;
}

RegionLayer.propTypes = {
  editor: PropTypes.object.isRequired,
};

export function region_layer({Editor, EditorInvisible, ui: {dialogs}, job_prm, cat: {templates, characteristics}, utils}) {

  dialogs.region_layer = function (project) {
    const layer = project.getActiveLayer();
    if(!layer || ![0, 4].includes(layer.kind)) {
      return dialogs.alert({
        title: 'Слой ряда',
        text: 'Текущий слой не выбран либо не может иметь рядов',
        timeout: 10000,
      });
    }
    const insets = new Set;
    const regions = new Set;
    const {profiles, info, children, sys} = layer;
    const irows = sys.inserts('region', 'rows', profiles.length ? profiles[0] : project);

    for(const {nom} of irows) {
      if(nom.region) {
        insets.add(nom);
        regions.add(nom.region);
      }
    }
    if(!insets.size) {
      return dialogs.alert({
        title: `Ряд для ${info}`,
        text: `В системе '${sys.name}' не описаны вставки рядов`,
        timeout: 10000,
      });
    }
    const values = Array.from(regions).map(v => v.toFixed());
    const initialValue = values[0];
    let pre = Promise.resolve(initialValue);
    if(regions.size > 1) {
      pre = dialogs.input_value({
        title: `Ряд для ${info}`,
        text: 'Уточните номер ряда',
        list: values,
        timeout: 10000,
      });
    }

    return pre
      .then((region) => {
        region = parseInt(region);
        const parent = region > 0 ? children.bottomLayers : children.topLayers;
        for(const rl of parent.children) {
          if(rl.dop.region === region) {
            return dialogs.alert({
              title: `Ряд для ${info}`,
              text: `Слой ряда №${region} уже существует`,
              timeout: 10000,
            });
          }
        }
        // создаём слой ряда
        const rl = Editor.Contour.create({kind: 5, region, project, layer, parent});
        // уточним цвет
        const {ox, _dp} = project;
        const clr_row = _dp.sys.clr_conformity.find({region});
        const clr = clr_row && $p.cat.clrs.by_predefined(clr_row.clr, ox.clr, ox.clr);
        // создаём профили ряда
        for(const elm of profiles) {
          const {generatrix, inset: {inserts}, width} = elm;
          // if(width < 2) {
          //   continue;
          // }
          let inset = project.default_inset({elm_type: 'region', pos: elm.pos, elm});
          if(!inset || !inserts.find({inset})) {
            for(const curr of insets) {
              const crow = inserts.find({inset: curr});
              if(curr.region == region && (!inset || crow)) {
                inset = curr;
                if(crow?.by_default) {
                  break;
                }
              }
            }
          }
          if(inset) {
            new Editor.ProfileRegion({
              layer: rl,
              parent: rl.children.profiles,
              generatrix: generatrix.clone({insert: false}),
              proto: {inset, ...(clr ? {clr} : null)},
            });
          }
        }
      })
      .catch(() => null);
  };

  dialogs.template_layer = function (project) {
    const {contours, activeLayer, _attr, ox, _scope} = project;
    const title = 'Слой из шаблона';
    if(!activeLayer || !activeLayer.bounds.area) {
      return dialogs.alert({
        title,
        text: 'Текущий слой не выбран либо не содержит профилей',
        timeout: 10000,
      });
    }
    if(contours.length === 1 && activeLayer === contours[0]) {
      return dialogs.alert({
        title,
        text: 'Изделие содержит единственный слой - воспользуйтесь стандартной загрузкой из шаблона',
        timeout: 10000,
      });
    }
    dialogs.templates_nested()
      .then(async (selected) => {
        if(selected === true) {
          const _obj = templates._select_template;
          const {templates_nested} = job_prm.builder;
          if(templates_nested && templates_nested.includes(_obj.calc_order)) {
            // останавливаем перерисовку
            _attr._lock = true;
            // создаём новое пустое изделие
            const tx = characteristics.create({calc_order: _obj.calc_order}, false, true);
            // заполняем его из шаблона устанавливаем систему и параметры
            const teditor = new EditorInvisible();
            const tproject = teditor.create_scheme();
            const {bounds} = activeLayer;

            const fin = () => {
              // возобновляем перерисовку
              _attr._lock = false;

              // выгружаем временный проект
              const {calc_order_row} = tx;
              calc_order_row && tx.calc_order.production.del(calc_order_row);
              teditor.unload();
              !tx.is_new() && tx.unload();
              _scope.activate();
            };

            tproject.load(tx, true, _obj.calc_order)
              .then(() => tproject.load_stamp(_obj.base_block, false, true, true))
              .then(() => {
                // подгоняем размеры под проём
                while (tproject._ch.length) {
                  tproject.redraw();
                }
                const {bottom, right} = tproject.l_dimensions;
                const root = tproject.contours[0];
                if(!root) {
                  throw new Error(`Нет слоёв в шаблоне ${_obj.base_block.name}`);
                }
                else if(tproject.contours.length > 1) {
                  throw new Error(`В шаблоне ${_obj.base_block.name} более 1 рамного слоя`);
                }
                bottom.redraw();
                right.redraw();
                const dx = (bounds.width - bottom.size).round(1);
                const dy = (bounds.height - right.size).round(1);
                dx && bottom._move_points({size: bounds.width - dx / 2, name: 'left'}, 'x');
                dy && right._move_points({size: bounds.height - dy / 2, name: 'bottom'}, 'y');
                root.redraw();
                dx && bottom._move_points({size: bounds.width, name: 'right'}, 'x');
                dy && right._move_points({size: bounds.height, name: 'top'}, 'y');
                root.redraw();
                // пересчитываем, не записываем
                root.refresh_prm_links(true);
                if(tproject._scope.eve._async?.move_points?.timer) {
                  clearTimeout(tproject._scope.eve._async.move_points.timer);
                  delete tproject._scope.eve._async.move_points.timer;
                }
                while (tproject._ch.length) {
                  tproject.redraw();
                }
                const tbounds = root.bounds;
                const delta = new teditor.Point((bounds.x - tbounds.x).round(1), (bounds.y - tbounds.y).round(1));
                if(delta.length) {
                  root.move(delta);
                  while (tproject._ch.length) {
                    tproject.redraw();
                  }
                }
                activeLayer.clear(true);
                return tproject.save_coordinates({svg: false, no_recalc: true})
                  .then(() => {
                    const {cnstr} = root;
                    const cmap = new Map();
                    for(const tmprow of tx.constructions) {
                      const nrow = tmprow === root._row ? activeLayer._row : ox.constructions.add();
                      if(!nrow.cnstr) {
                        nrow.cnstr = ox.constructions.aggregate([], ['cnstr'], 'MAX') + 1;
                      }
                      cmap.set(tmprow, nrow);
                      cmap.set(tmprow.cnstr, nrow.cnstr);
                      utils._mixin(nrow, tmprow._obj, null, ['row', 'cnstr']);
                    }
                    for(const tmprow of tx.constructions) {
                      const nrow = cmap.get(tmprow);
                      const parent = cmap.get(nrow.parent);
                      if(parent) {
                        nrow.parent = parent;
                      }
                    }
                  });
              })
              .then(() => {

              })
              .then(fin)
              .catch((err) => {
                fin();
                dialogs.alert({title: 'Вставка вложенного изделия', text: err.message});
              });

          }
        }
      });
  }
}
export default RegionLayer;
