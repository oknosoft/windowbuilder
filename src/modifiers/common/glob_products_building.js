/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  glob_products_building
 * Created 26.05.2015
 */

class ProductsBuilding {

  constructor(listen) {

    let added_cnn_spec,
      ox,
      spec,
      constructions,
      coordinates,
      cnn_elmnts,
      glass_specification,
      params;

    //this._editor_invisible = null;


    /**
     * СтрокаСоединений
     * @param elm1
     * @param elm2
     * @return {Number|DataObj}
     */
    function cnn_row(elm1, elm2) {
      let res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
      if(res.length) {
        return res[0].row;
      }
      res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
      if(res.length) {
        return res[0].row;
      }
      return 0;
    }

    /**
     * НадоДобавитьСпецификациюСоединения
     * @param cnn
     * @param elm1
     * @param elm2
     */
    function cnn_need_add_spec(cnn, elm1, elm2, point) {
      // соединения крест в стык обрабатываем по координатам, остальные - по паре элементов
      if(cnn && cnn.cnn_type == $p.enm.cnn_types.xx) {
        if(!added_cnn_spec.points) {
          added_cnn_spec.points = [];
        }
        for (let p of added_cnn_spec.points) {
          if(p.is_nearest(point, true)) {
            return false;
          }
        }
        added_cnn_spec.points.push(point);
        return true;
      }
      else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1) {
        return false;
      }
      added_cnn_spec[elm1] = elm2;
      return true;
    }


    /**
     * ДополнитьСпецификациюСпецификациейСоединения
     * @method cnn_add_spec
     * @param cnn {_cat.Cnns}
     * @param elm {BuilderElement}
     * @param len_angl {Object}
     */
    function cnn_add_spec(cnn, elm, len_angl, cnn_other) {
      if(!cnn) {
        return;
      }
      const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      cnn_filter_spec(cnn, elm, len_angl).forEach((row_cnn_spec) => {

        const {nom} = row_cnn_spec;

        // TODO: nom может быть вставкой - в этом случае надо разузловать
        if(nom instanceof $p.CatInserts) {
          if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)) {
            const tmp_len_angl = len_angl._clone();
            tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
            nom.calculate_spec({elm, len_angl: tmp_len_angl, ox});
          }
          else {
            nom.calculate_spec({elm, len_angl, ox});
          }
        }
        else {

          const row_spec = new_spec_row({row_base: row_cnn_spec, origin: len_angl.origin || cnn, elm, nom, spec, ox});

          // рассчитаем количество
          if(nom.is_pieces) {
            if(!row_cnn_spec.coefficient) {
              row_spec.qty = row_cnn_spec.quantity;
            }
            else {
              row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
                .round(nom.rounding_quantity);
            }
          }
          else {
            row_spec.qty = row_cnn_spec.quantity;

            // если указано cnn_other, берём не размер соединения, а размеры предыдущего и последующего
            if(row_cnn_spec.sz || row_cnn_spec.coefficient) {
              let sz = row_cnn_spec.sz, finded, qty;
              if(cnn_other) {
                cnn_other.specification.find_rows({nom}, (row) => {
                  sz += row.sz;
                  qty = row.quantity;
                  return !(finded = true);
                });
              }
              if(!finded) {
                sz *= 2;
              }
              if(!row_spec.qty && finded && len_angl.art1) {
                row_spec.qty = qty;
              }
              row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
            }
          }

          // если указана формула - выполняем
          if(!row_cnn_spec.formula.empty()) {
            const qty = row_cnn_spec.formula.execute({
              ox,
              elm,
              len_angl,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_spec,
              row_spec: row_spec
            });
            // если формула является формулой условия, используем результат, как фильтр
            if(row_cnn_spec.formula.condition_formula && !qty){
              row_spec.qty = 0;
            }
          }
          calc_count_area_mass(row_spec, spec, len_angl, row_cnn_spec.angle_calc_method);
        }

      });
    }

    /**
     * ПолучитьСпецификациюСоединенияСФильтром
     * @param cnn
     * @param elm
     * @param len_angl
     */
    function cnn_filter_spec(cnn, elm, len_angl) {

      const res = [];
      const {angle_hor} = elm;
      const {art1, art2} = $p.job_prm.nom;
      const {САртикулом1, САртикулом2} = $p.enm.specification_installation_methods;
      const {check_params} = ProductsBuilding;

      const {cnn_type, specification, selection_params} = cnn;
      const {ii, xx, acn} = $p.enm.cnn_types;

      specification.each((row) => {
        const {nom} = row;
        if(!nom || nom.empty() || nom == art1 || nom == art2) {
          return;
        }

        // только для прямых или только для кривых профилей
        if((row.for_direct_profile_only > 0 && !elm.is_linear()) ||
          (row.for_direct_profile_only < 0 && elm.is_linear())) {
          return;
        }

        //TODO: реализовать фильтрацию
        if(cnn_type == ii) {
          if(row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len) {
            return;
          }
        }
        else {
          if(row.amin > len_angl.angle || row.amax < len_angl.angle) {
            return;
          }
        }

        // "устанавливать с" проверяем только для соединений профиля
        if((row.set_specification == САртикулом1 && len_angl.art2) || (row.set_specification == САртикулом2 && len_angl.art1)) {
          return;
        }
        // для угловых, разрешаем art2 только явно для art2
        if(len_angl.art2 && acn.a.indexOf(cnn_type) != -1 && row.set_specification != САртикулом2 && cnn_type != xx) {
          return;
        }

        // проверяем параметры изделия и добавляем, если проходит по ограничениям
        if(check_params({params: selection_params, row_spec: row, elm, ox})) {
          res.push(row);
        }

      });

      return res;
    }


    /**
     * Спецификации фурнитуры
     * @param contour {Contour}
     */
    function furn_spec(contour) {

      // у рамных контуров фурнитуры не бывает
      if(!contour.parent) {
        return false;
      }

      // кеш сторон фурнитуры
      const {furn_cache, furn} = contour;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      // проверяем, подходит ли фурнитура под геометрию контура
      if(!furn_check_opening_restrictions(contour, furn_cache)) {
        return;
      }

      // уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
      contour.update_handle_height(furn_cache);

      // получаем спецификацию фурнитуры и переносим её в спецификацию изделия
      const blank_clr = $p.cat.clrs.get();
      furn.furn_set.get_spec(contour, furn_cache).each((row) => {
        const elm = {elm: -contour.cnstr, clr: blank_clr};
        const row_spec = new_spec_row({elm, row_base: row, origin: row.origin, spec, ox});

        if(row.is_procedure_row) {
          row_spec.elm = row.handle_height_min;
          row_spec.len = row.coefficient / 1000;
          row_spec.qty = 0;
          row_spec.totqty = 1;
          row_spec.totqty1 = 1;
        }
        else {
          row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
          calc_count_area_mass(row_spec, spec);
        }
      });
    }

    /**
     * Проверяет ограничения открывания, добавляет визуализацию ошибок
     * @param contour {Contour}
     * @param cache {Object}
     * @return {boolean}
     */
    function furn_check_opening_restrictions(contour, cache) {

      let ok = true;
      const {new_spec_row} = ProductsBuilding;

      // TODO: реализовать проверку по количеству сторон

      // проверка геометрии
      contour.furn.open_tunes.each((row) => {
        const elm = contour.profile_by_furn_side(row.side, cache);
        const len = elm._row.len - 2 * elm.nom.sizefurn;

        // angle_hor = elm.angle_hor; TODO: реализовать проверку углов

        if(len < row.lmin || len > row.lmax || (!elm.is_linear() && !row.arc_available)) {
          new_spec_row({elm, row_base: {clr: $p.cat.clrs.get(), nom: $p.job_prm.nom.furn_error}, origin: contour.furn, spec, ox});
          ok = false;
        }

      });

      return ok;
    }


    /**
     * Спецификации соединений примыкающих профилей
     * @param elm {Profile}
     */
    function cnn_spec_nearest(elm) {
      const nearest = elm.nearest();
      if(nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm._attr._nearest_cnn) {
        cnn_add_spec(elm._attr._nearest_cnn, elm, {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: elm._attr._len,
          origin: cnn_row(elm.elm, nearest.elm)
        });
      }
    }

    /**
     * Спецификация профиля
     * @param elm {Profile}
     */
    function base_spec_profile(elm) {

      const {_row, rays} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const {b, e} = rays;

      if(!b.cnn || !e.cnn) {
        return;
      }
      b.check_err();
      e.check_err();

      const prev = b.profile;
      const next = e.profile;
      const row_cnn_prev = b.cnn.main_row(elm);
      const row_cnn_next = e.cnn.main_row(elm);
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      let row_spec;

      // добавляем строку спецификации
      const row_cnn = row_cnn_prev || row_cnn_next;
      if(row_cnn) {

        row_spec = new_spec_row({elm, row_base: row_cnn, nom: _row.nom, origin: cnn_row(_row.elm, prev ? prev.elm : 0), spec, ox});
        row_spec.qty = row_cnn.quantity;

        // уточняем размер
        const seam = $p.enm.angle_calculating_ways.СварнойШов;
        const d45 = Math.sin(Math.PI / 4);
        const dprev = row_cnn_prev ? (
          row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz
        ) : 0;
        const dnext = row_cnn_next ? (
          row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz
        ) : 0;

        row_spec.len = (_row.len - dprev - dnext)
          * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        // profile._len - то, что получится после обработки
        // row_spec.len - сколько взять (отрезать)
        elm._attr._len = _row.len;
        _row.len = (_row.len
          - (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz)
          - (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz))
          * 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        // припуск для гнутых элементов
        if(!elm.is_linear()) {
          row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
        }

        // дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
        if(row_cnn_prev && !row_cnn_prev.formula.empty()) {
          row_cnn_prev.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_prev,
            row_spec: row_spec
          });
        }
        else if(row_cnn_next && !row_cnn_next.formula.empty()) {
          row_cnn_next.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_next,
            row_spec: row_spec
          });
        }

        // РассчитатьКоличествоПлощадьМассу
        const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
        const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
        const {СоединениеПополам, Соединение} = $p.enm.angle_calculating_ways;
        calc_count_area_mass(
          row_spec,
          spec,
          _row,
          angle_calc_method_prev,
          angle_calc_method_next,
          angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0,
          angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0
        );
      }

      // добавляем спецификации соединений
      const len_angl = {
        angle: 0,
        alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
        alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
        len: row_spec ? row_spec.len * 1000 : _row.len,
        art1: false,
        art2: true
      };
      if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0, b.point)) {


        len_angl.angle = len_angl.alp2;

        // для ТОбразного и Незамкнутого контура надо рассчитать еще и с другой стороны
        if(b.cnn.cnn_type == $p.enm.cnn_types.t || b.cnn.cnn_type == $p.enm.cnn_types.i || b.cnn.cnn_type == $p.enm.cnn_types.xx) {
          if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm, e.point)) {
            cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
          }
        }
        // для угловых, добавляем из e.cnn строки с {art2: true}
        else {
          cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
        }

        // спецификацию с предыдущей стороны рассчитваем всегда
        len_angl.angle = len_angl.alp1;
        len_angl.art2 = false;
        len_angl.art1 = true;
        cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
      }

      // спецификация вставки
      elm.inset.calculate_spec({elm, ox});

      // если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
      cnn_spec_nearest(elm);

      // если у профиля есть доборы, добавляем их спецификации
      elm.addls.forEach(base_spec_profile);

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }

        len_angl.origin = inset;
        len_angl.angle = elm.angle_hor;
        len_angl.cnstr = elm.layer.cnstr;
        delete len_angl.art1;
        delete len_angl.art2;
        inset.calculate_spec({elm, len_angl, ox});

      });

    }

    /**
     * Спецификация сечения (водоотлива)
     * @param elm {Sectional}
     */
    function base_spec_sectional(elm) {

      const {_row, _attr, inset, layer} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      // во время расчетов возможна подмена объекта спецификации
      const spec_tmp = spec;

      // спецификация вставки
      inset.calculate_spec({elm, ox});

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
          const cx = Object.assign(ox.find_create_cx(elm.elm, inset.ref), inset.contour_attrs(layer));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        // рассчитаем спецификацию вставки
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: layer.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      // восстанавливаем исходную ссылку объекта спецификации
      spec = spec_tmp;

    }

    /**
     * Спецификация заполнения
     * @param elm {Filling}
     */
    function base_spec_glass(elm) {

      const {profiles, imposts, _row} = elm;

      if(_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const glength = profiles.length;

      // для всех рёбер заполнения
      for (let i = 0; i < glength; i++) {
        const curr = profiles[i];

        if(curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        const prev = (i == 0 ? profiles[glength - 1] : profiles[i - 1]).profile;
        const next = (i == glength - 1 ? profiles[0] : profiles[i + 1]).profile;
        const row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

        const len_angl = {
          angle: 0,
          alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
          alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
          len: row_cnn.length ? row_cnn[0].aperture_len : 0,
          origin: cnn_row(_row.elm, curr.profile.elm)

        };

        // добавляем спецификацию соединения рёбер заполнения с профилем
        (len_angl.len > 3) && cnn_add_spec(curr.cnn, curr.profile, len_angl);

      }

      // добавляем спецификацию вставки в заполнение
      elm.inset.calculate_spec({elm, ox});

      // для всех раскладок заполнения
      imposts.forEach(base_spec_profile);

      // спецификация вложенных в элемент вставок
      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {
        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }
        inset.calculate_spec({elm, ox});
      });
    }


    /**
     * Спецификация вставок в контур
     * @param contour
     */
    function inset_contour_spec(contour) {

      // во время расчетов возможна подмена объекта спецификации
      const spec_tmp = spec;

      ox.inserts.find_rows({cnstr: contour.cnstr}, ({inset, clr}) => {

        // если во вставке указано создавать продукцию, создаём
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
          const cx = Object.assign(ox.find_create_cx(-contour.cnstr, inset.ref), inset.contour_attrs(contour));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        // рассчитаем спецификацию вставки
        const elm = {
          _row: {},
          elm: 0,
          clr: clr,
          layer: contour,
        };
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: contour.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      // восстанавливаем исходную ссылку объекта спецификации
      spec = spec_tmp;
    }

    /**
     * Основная cпецификация по соединениям и вставкам таблицы координат
     * @param scheme {Scheme}
     */
    function base_spec(scheme) {

      const {Contour, Filling, Sectional, Profile, ProfileConnective} = $p.Editor;

      // сбрасываем структуру обработанных соединений
      added_cnn_spec = {};

      // для всех контуров изделия
      for (const contour of scheme.getItems({class: Contour})) {

        // для всех профилей контура
        for (const elm of contour.children) {
          elm instanceof Profile && base_spec_profile(elm);
        }

        for (const elm of contour.children) {
          if(elm instanceof Filling) {
            // для всех заполнений контура
            base_spec_glass(elm);
          }
          else if(elm instanceof Sectional) {
            // для всех разрезов (водоотливов)
            base_spec_sectional(elm);
          }
        }

        // фурнитура контура
        furn_spec(contour);

        // спецификация вставок в контур
        inset_contour_spec(contour);

      }

      // для всех соединительных профилей
      for (const elm of scheme.l_connective.children) {
        if(elm instanceof ProfileConnective) {
          base_spec_profile(elm);
        }
      }

      // спецификация вставок в изделие
      inset_contour_spec({
        cnstr: 0,
        project: scheme,
        get perimeter() {
          return this.project.perimeter;
        }
      });

    }

    /**
     * Пересчет спецификации при записи изделия
     */
    this.recalc = function (scheme, attr) {

      //console.time("base_spec");
      //console.profile();


      // ссылки для быстрого доступа к свойствам объекта продукции
      ox = scheme.ox;
      spec = ox.specification;
      constructions = ox.constructions;
      coordinates = ox.coordinates;
      cnn_elmnts = ox.cnn_elmnts;
      glass_specification = ox.glass_specification;
      params = ox.params;

      // чистим спецификацию
      spec.clear();

      // массив продукций к добавлению в заказ
      ox._order_rows = [];

      // рассчитываем базовую сецификацию
      base_spec(scheme);

      // сворачиваем
      spec.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');


      //console.timeEnd("base_spec");
      //console.profileEnd();

      // информируем мир об окончании расчета координат
      scheme.draw_visualization();
      scheme.notify(scheme, 'coordinates_calculated', attr);


      // производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
      // внутри корректировки будут рассчитаны цены продажи и плановой себестоимости
      if(ox.calc_order_row) {
        $p.spec_building.specification_adjustment({
          scheme: scheme,
          calc_order_row: ox.calc_order_row,
          spec: spec,
          save: attr.save,
        }, true);
      }

      // информируем мир о завершении пересчета
      if(attr.snapshot) {
        scheme.notify(scheme, 'scheme_snapshot', attr);
      }

      // информируем мир о записи продукции
      if(attr.save) {

        // console.time("save");
        // console.profile();

        // сохраняем картинку вместе с изделием
        if(attr.svg !== false) {
          ox.svg = scheme.get_svg();
        }

        ox.save().then(() => {
          attr.svg !== false && $p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
          delete scheme._attr._saving;
          ox.calc_order.characteristic_saved(scheme, attr);
          scheme._scope && scheme._scope.eve.emit('characteristic_saved', scheme, attr);

          // console.timeEnd("save");
          // console.profileEnd();
        })
          .then(() => scheme._scope && setTimeout(() => ox.calc_order._modified && ox.calc_order.save(), 1000))
          .catch((ox) => {

            // console.timeEnd("save");
            // console.profileEnd();

            $p.record_log(ox);
            delete scheme._attr._saving;
            if(ox._data && ox._data._err) {
              $p.msg.show_msg(ox._data._err);
              delete ox._data._err;
            }
          });
      }
      else {
        delete scheme._attr._saving;
      }

      ox._data._loading = false;

    };

  }

  /**
   * Проверяет соответствие параметров отбора параметрам изделия
   * @param params {TabularSection} - табчасть параметров вставки или соединения
   * @param row_spec {TabularSectionRow}
   * @param elm {BuilderElement}
   * @param [cnstr] {Number} - номер конструкции или элемента
   * @return {boolean}
   */
  static check_params({params, row_spec, elm, cnstr, origin, ox}) {

    let ok = true;

    // режем параметры по элементу
    params.find_rows({elm: row_spec.elm}, (prm_row) => {
      // выполнение условия рассчитывает объект CchProperties
      ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
      if(!ok) {
        return false;
      }
    });

    return ok;
  }

  /**
   * Добавляет или заполняет строку спецификации
   * @param row_spec
   * @param elm
   * @param row_base
   * @param spec
   * @param [nom]
   * @param [origin]
   * @return {TabularSectionRow.cat.characteristics.specification}
   */
  static new_spec_row({row_spec, elm, row_base, nom, origin, spec, ox}) {
    if(!row_spec) {
      // row_spec = this.ox.specification.add();
      row_spec = spec.add();
    }
    row_spec.nom = nom || row_base.nom;
    if(!row_spec.nom.visualization.empty()) {
      row_spec.dop = -1;
    }
    else if(row_spec.nom.is_procedure) {
      row_spec.dop = -2;
    }
    row_spec.characteristic = row_base.nom_characteristic;
    if(!row_spec.characteristic.empty() && row_spec.characteristic.owner != row_spec.nom) {
      row_spec.characteristic = $p.utils.blank.guid;
    }
    row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr, elm, spec);
    row_spec.elm = elm.elm;
    if(origin) {
      row_spec.origin = origin;
    }
    return row_spec;
  }

  /**
   * РассчитатьQtyLen
   * @param row_spec
   * @param row_base
   * @param len
   */
  static calc_qty_len(row_spec, row_base, len) {

    const {nom} = row_spec;

    if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
      nom.cutting_optimization_type.empty() || nom.is_pieces) {
      if(!row_base.coefficient || !len) {
        row_spec.qty = row_base.quantity;
      }
      else {
        if(!nom.is_pieces) {
          row_spec.qty = row_base.quantity;
          row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
          if(nom.rounding_quantity) {
            row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
            row_spec.len = 0;
          }
          ;
        }
        else if(!nom.rounding_quantity) {
          row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
        }
        else {
          row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
        }
      }
    }
    else {
      row_spec.qty = row_base.quantity;
      row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
    }
  }

  /**
   * РассчитатьКоличествоПлощадьМассу
   * @param row_spec
   * @param row_coord
   */
  static calc_count_area_mass(row_spec, spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2) {

    if(!row_spec.qty) {
      // dop=-1 - визуализация, dop=-2 - техоперация,
      if(row_spec.dop >= 0) {
        spec.del(row_spec.row - 1, true);
      }
      return;
    }

    // если свойства уже рассчитаны в формуле, пересчет не выполняем
    if(row_spec.totqty1 && row_spec.totqty) {
      return;
    }

    //TODO: учесть angle_calc_method
    if(!angle_calc_method_next) {
      angle_calc_method_next = angle_calc_method_prev;
    }

    if(angle_calc_method_prev && !row_spec.nom.is_pieces) {

      const {Основной, СварнойШов, СоединениеПополам, Соединение, _90} = $p.enm.angle_calculating_ways;

      if((angle_calc_method_prev == Основной) || (angle_calc_method_prev == СварнойШов)) {
        row_spec.alp1 = row_coord.alp1;
      }
      else if(angle_calc_method_prev == _90) {
        row_spec.alp1 = 90;
      }
      else if(angle_calc_method_prev == СоединениеПополам) {
        row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
      }
      else if(angle_calc_method_prev == Соединение) {
        row_spec.alp1 = (alp1 || row_coord.alp1);
      }

      if((angle_calc_method_next == Основной) || (angle_calc_method_next == СварнойШов)) {
        row_spec.alp2 = row_coord.alp2;
      }
      else if(angle_calc_method_next == _90) {
        row_spec.alp2 = 90;
      }
      else if(angle_calc_method_next == СоединениеПополам) {
        row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
      }
      else if(angle_calc_method_next == Соединение) {
        row_spec.alp2 = (alp2 || row_coord.alp2);
      }
    }

    if(row_spec.len) {
      if(row_spec.width && !row_spec.s) {
        row_spec.s = row_spec.len * row_spec.width;
      }
    }
    else {
      row_spec.s = 0;
    }

    if(row_spec.s) {
      row_spec.totqty = row_spec.qty * row_spec.s;
    }
    else if(row_spec.len) {
      row_spec.totqty = row_spec.qty * row_spec.len;
    }
    else {
      row_spec.totqty = row_spec.qty;
    }

    row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

    ['len', 'width', 's', 'qty', 'alp1', 'alp2'].forEach((fld) => row_spec[fld] = row_spec[fld].round(4));
    ['totqty', 'totqty1'].forEach((fld) => row_spec[fld] = row_spec[fld].round(6));
  }

}

if(typeof global !== 'undefined'){
  global.ProductsBuilding = ProductsBuilding;
}
$p.ProductsBuilding = ProductsBuilding;
$p.products_building = new ProductsBuilding(true);

