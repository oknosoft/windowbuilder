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
    templates._select_template.init()
      .then(() => dialogs.templates_inline())
      .then(async (selected) => {
        const {base_block, refill, sys, clr, params} = templates._select_template;
        if(selected === base_block) {
          // const {templates_nested} = job_prm.builder;

          // останавливаем перерисовку
          _attr._lock = true;
          // создаём новое пустое изделие
          const tx = characteristics.create({calc_order: ox.calc_order}, false, true);
          // заполняем его из шаблона устанавливаем систему и параметры
          const teditor = new EditorInvisible();
          const tproject = teditor.create_scheme();
          const {bounds, layer: parent} = activeLayer;

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

          tproject.load(tx, true, ox.calc_order)
            .then(() => {
              if(refill) {
                tproject._dp._data._loading = true;
              }
              return tproject.load_stamp(selected, false, true, true);
            })
            .then(() => {
              if(refill) {
                !sys.empty() && tproject.set_sys(sys, params, refill);
                tproject._dp._data._loading = false;
                if(!clr.empty()){
                  tx.clr = clr;
                  tproject.getItems({class: Editor.BuilderElement}).forEach((elm) => {
                    if(!(elm instanceof Editor.Onlay) && !(elm instanceof Editor.Filling)) {
                      elm.clr = clr;
                    }
                  });
                }
              }
              // подгоняем размеры под проём
              while (tproject._ch.length) {
                tproject.redraw();
              }
              const {bottom, right} = tproject.l_dimensions;
              const root = tproject.contours[0];
              if(!root) {
                throw new Error(`Нет слоёв в шаблоне ${base_block.name}`);
              }
              else if(tproject.contours.length > 1) {
                throw new Error(`В шаблоне ${base_block.name} более 1 рамного слоя`);
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
              activeLayer.remove();
              return tproject.save_coordinates({svg: false, no_recalc: true})
                .then(() => {
                  const {cnstr} = root;
                  const cmap = new Map();
                  for(const tmp of tx.constructions) {
                    const nrow = ox.constructions.add({cnstr: ox.constructions.aggregate([], ['cnstr'], 'MAX') + 1});
                    if(parent && !tmp.parent) {
                      cmap.set(0, parent.cnstr);
                    }
                    cmap.set(tmp, nrow);
                    cmap.set(tmp.cnstr, nrow.cnstr);
                  }
                  for(const tmp of tx.constructions) {
                    const nrow = cmap.get(tmp);
                    const parentNum = cmap.get(tmp.parent);
                    if(parentNum) {
                      nrow.parent = parentNum;
                    }
                    utils._mixin(nrow, tmp._obj, null, ['row', 'cnstr', 'parent']);
                  }
                  const emap = new Map();
                  for(const tmp of tx.coordinates) {
                    const nrow = ox.coordinates.add({
                      elm: ox.coordinates.aggregate([], ['elm'], 'max') + 1,
                      cnstr: cmap.get(tmp.cnstr),
                    });
                    emap.set(tmp, nrow);
                    emap.set(tmp.elm, nrow.elm);
                  }
                  for(const tmp of tx.coordinates) {
                    const nrow = emap.get(tmp);
                    if(tmp.parent) {
                      nrow.parent = emap.get(tmp.parent);
                    }
                    utils._mixin(nrow, tmp._obj, null, ['row', 'elm', 'cnstr', 'parent']);
                  }
                  const row = cmap.get(root._row);
                  if(project._dp.sys !== sys) {
                    row.dop = {sys: sys.valueOf()};
                  }
                  project.load_contour(Editor.Contour.create({project, parent, row: cmap.get(root._row)}));
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
      })
      .catch((err) => {
        return null;
      });
  }
}
export default RegionLayer;
