/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2017
 * @author Evgeniy Malyarov
 * @module cat_inserts
 */

$p.cat.inserts.__define({

	_inserts_types_filling: {
		value: [
			$p.enm.inserts_types.Заполнение
		]
	},

	by_thickness: {
		value: function (min, max) {

			if(!this._by_thickness){
				this._by_thickness = {};
				this.find_rows({insert_type: {in: this._inserts_types_filling}}, (ins) => {
					if(ins.thickness > 0){
						if(!this._by_thickness[ins.thickness])
							this._by_thickness[ins.thickness] = [];
						this._by_thickness[ins.thickness].push(ins);
					}
				});
			}

			const res = [];
			for(let thickness in this._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, this._by_thickness[thickness]);
			}
			return res;

		}
	},

  sql_selection_list_flds: {
	  value: function (initial_value) {
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as insert_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_inserts AS _t_" +
        " left outer join enm_inserts_types as _k_ on _k_.ref = _t_.insert_type %3 %4 LIMIT 300";
    }
  }

});

(($p) => {

  const Proto = $p.CatInserts;

  // переопределяем прототип
  $p.CatInserts = class CatInserts extends Proto {

    /**
     * Возвращает номенклатуру вставки в завсисмости от свойств элемента
     */
    nom(elm, strict) {

      const {_data} = this;
      if(!strict && _data.nom){
        return _data.nom;
      }

      const main_rows = [];
      let _nom;

      this.specification.find_rows({is_main_elm: true}, (row) => main_rows.push(row));

      if(!main_rows.length && !strict && this.specification.count()){
        main_rows.push(this.specification.get(0))
      }

      if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts){
        if(main_rows[0].nom == this){
          _nom = $p.cat.nom.get()
        }
        else{
          _nom = main_rows[0].nom.nom(elm, strict)
        }
      }
      else if(main_rows.length){
        if(elm && !main_rows[0].formula.empty()){
          try{
            _nom = main_rows[0].formula.execute({elm});
            if(!_nom){
              _nom = main_rows[0].nom
            }
          }catch(e){
            _nom = main_rows[0].nom
          }
        }
        else{
          _nom = main_rows[0].nom
        }
      }
      else{
        _nom = $p.cat.nom.get()
      }

      if(main_rows.length < 2){
        _data.nom = typeof _nom == 'string' ? $p.cat.nom.get(_nom) : _nom;
      }
      else{
        // TODO: реализовать фильтр
        _data.nom = _nom;
      }

      return _data.nom;
    }

    /**
     * Возвращает атрибуты характеристики виртуальной продукции по вставке в контур
     */
    contour_attrs(contour) {

      const main_rows = [];
      const res = {calc_order: contour.project.ox.calc_order};

      this.specification.find_rows({is_main_elm: true}, (row) => {
        main_rows.push(row);
        return false;
      });

      if(main_rows.length){
        const irow = main_rows[0],
          sizes = {},
          sz_keys = {},
          sz_prms = ['length', 'width', 'thickness'].map((name) => {
            const prm = $p.job_prm.properties[name];
            sz_keys[prm.ref] = name;
            return prm;
          });

        // установим номенклатуру продукции
        res.owner = irow.nom instanceof $p.CatInserts ? irow.nom.nom() : irow.nom;

        // если в параметрах вставки задействованы свойства длина и или ширина - габариты получаем из свойств
        contour.project.ox.params.find_rows({
          cnstr: contour.cnstr,
          inset: this,
          param: {in: sz_prms}
        }, (row) => {
          sizes[sz_keys[row.param.ref]] = row.value
        });

        if(Object.keys(sizes).length > 0){
          res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.s = ((res.x * res.y) / 1000000).round(3);
          res.z = sizes.thickness * (irow.coefficient * 1000 || 1);
        }
        else{
          if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()){
            irow.formula.execute({
              ox: contour.project.ox,
              contour: contour,
              inset: this,
              row_ins: irow,
              res: res
            });
          }
          if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади && this.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
            // получаем смещенный периметр
            const perimeter = contour.perimeter_inner(irow.sz);
            const path = new paper.Path({insert: false});
            for(let curr of perimeter){
              path.addSegments(curr.sub_path.segments);
            }
            if(path.segments.length && !path.closed){
              path.closePath(true);
            }
            path.reduce();
            const {bounds} = path;
            res.x = bounds.width.round(1);
            res.y = bounds.height.round(1);
            res.s = ((res.x * res.y) / 1000000).round(3);
          }
          else{
            res.x = contour.w + irow.sz;
            res.y = contour.h + irow.sz;
            res.s = ((res.x * res.y) / 1000000).round(3);
          }
        }
      }

      return res;

    }

    /**
     * Проверяет ограничения вставки или строки вставки
     * @param row {CatInserts|CatInsertsSpecificationRow}
     * @param elm {BuilderElement}
     * @param by_perimetr {Boolean}
     * @param len_angl {Object}
     * @return {Boolean}
     */
    check_restrictions(row, elm, by_perimetr, len_angl) {

      const {_row} = elm;
      const len = len_angl ? len_angl.len : _row.len;
      const is_linear = elm.is_linear ? elm.is_linear() : true;
      let is_tabular = true;

      // проверяем площадь
      if(row.smin > _row.s || (_row.s && row.smax && row.smax < _row.s)){
        return false;
      }

      // Главный элемент с нулевым количеством не включаем
      if(row.is_main_elm && !row.quantity){
        return false;
      }

      // только для прямых или только для кривых профилей
      if((row.for_direct_profile_only > 0 && !is_linear) || (row.for_direct_profile_only < 0 && is_linear)){
        return false;
      }

      if($p.utils.is_data_obj(row)){

        if(row.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
          if(!elm.joined_imposts(true)){
            return false;
          }

        }else if(row.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
          if(elm.joined_imposts(true)){
            return false;
          }
        }
        is_tabular = false;
      }


      if(!is_tabular || by_perimetr || row.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
        if(row.lmin > len || (row.lmax < len && row.lmax > 0)){
          return false;
        }
        if(row.ahmin > _row.angle_hor || row.ahmax < _row.angle_hor){
          return false;
        }
      }

      //// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

      return true;
    }

    /**
     * Возвращает спецификацию вставки с фильтром
     * @method filtered_spec
     * @param elm {BuilderElement|Object} - элемент, к которому привязана вставка
     * @param ox {CatCharacteristics} - текущая продукция
     * @param [is_high_level_call] {Boolean} - вызов верхнего уровня - специфично для стеклопакетов
     * @param [len_angl] {Object} - контекст размеров элемента
     * @param [own_row] {CatInsertsSpecificationRow} - родительская строка для вложенных вставок
     * @return {Array}
     */
    filtered_spec({elm, is_high_level_call, len_angl, own_row, ox}) {

      const res = [];

      if(this.empty()){
        return res;
      }

      function fake_row(row) {
        if(row._metadata){
          const res = {};
          for(let fld in row._metadata.fields){
            res[fld] = row[fld];
          }
          return res;
        }
        else{
          return Object.assign({}, row);
        }
      }

      const {insert_type, check_restrictions} = this;
      const {Профиль, Заполнение} = $p.enm.inserts_types;
      const {check_params} = ProductsBuilding;

      // для заполнений, можно переопределить состав верхнего уровня
      if(is_high_level_call && (insert_type == Заполнение)){

        const glass_rows = [];
        ox.glass_specification.find_rows({elm: elm.elm}, (row) => {
          glass_rows.push(row);
        });

        // если спецификация верхнего уровня задана в изделии, используем её, параллельно формируем формулу
        if(glass_rows.length){
          glass_rows.forEach((row) => {
            row.inset.filtered_spec({elm, len_angl, ox}).forEach((row) => {
              res.push(row);
            });
          });
          return res;
        }
      }

      this.specification.each((row) => {

        // Проверяем ограничения строки вставки
        if(!check_restrictions(row, elm, insert_type == Профиль, len_angl)){
          return;
        }

        // Проверяем параметры изделия, контура или элемента
        if(own_row && row.clr.empty() && !own_row.clr.empty()){
          row = fake_row(row);
          row.clr = own_row.clr;
        }
        if(!check_params({
            params: this.selection_params,
            ox: ox,
            elm: elm,
            row_spec: row,
            cnstr: len_angl && len_angl.cnstr,
            origin: len_angl && len_angl.origin,
        })){
          return;
        }

        // Добавляем или разузловываем дальше
        if(row.nom instanceof $p.CatInserts){
          row.nom.filtered_spec({elm, len_angl, own_row, ox}).forEach((subrow) => {
            const fakerow = fake_row(subrow);
            fakerow.quantity = (subrow.quantity || 1) * (row.quantity || 1);
            fakerow.coefficient = (subrow.coefficient || 1) * (row.coefficient || 1);
            fakerow._origin = row.nom;
            if(fakerow.clr.empty()){
              fakerow.clr = row.clr;
            }
            res.push(fakerow);
          });
        }
        else{
          res.push(row);
        }

      });

      return res;
    }

    /**
     * Дополняет спецификацию изделия спецификацией текущей вставки
     * @method calculate_spec
     * @param elm {BuilderElement}
     * @param len_angl {Object}
     * @param ox {CatCharacteristics}
     * @param spec {TabularSection}
     */
    calculate_spec({elm, len_angl, ox, spec}) {

      const {_row} = elm;
      const {ПоПериметру, ПоШагам, ПоФормуле, ДляЭлемента, ПоПлощади} = $p.enm.count_calculating_ways;
      const {profile_items} = $p.enm.elm_types;
      const {new_spec_row, calc_qty_len, calc_count_area_mass} = ProductsBuilding;

      if(!spec){
        spec = ox.specification;
      }

      this.filtered_spec({elm, is_high_level_call: true, len_angl, ox}).forEach((row_ins_spec) => {

        const origin = row_ins_spec._origin || this;

        let row_spec;

        // добавляем строку спецификации, если профиль или не про шагам
        if((row_ins_spec.count_calc_method != ПоПериметру && row_ins_spec.count_calc_method != ПоШагам) || profile_items.indexOf(_row.elm_type) != -1){
          row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
        }

        if(row_ins_spec.count_calc_method == ПоФормуле && !row_ins_spec.formula.empty()){
          // если строка спецификации не добавлена на предыдущем шаге, делаем это сейчас
          row_spec = new_spec_row({row_spec, elm, row_base: row_ins_spec, origin, spec, ox});
        }
        // для вставок в профиль способ расчета количество не учитывается
        else if(profile_items.indexOf(_row.elm_type) != -1 || row_ins_spec.count_calc_method == ДляЭлемента){
          calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
        }
        else{

          if(row_ins_spec.count_calc_method == ПоПлощади){
            row_spec.qty = row_ins_spec.quantity;
            row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.s = _row.s;
          }
          else if(row_ins_spec.count_calc_method == ПоПериметру){
            const row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
            const perimeter = elm.perimeter ? elm.perimeter : (
              this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ? elm.layer.perimeter_inner(row_ins_spec.sz) : elm.layer.perimeter
            )
            perimeter.forEach((rib) => {
              row_prm._row._mixin(rib);
              row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
              if(this.check_restrictions(row_ins_spec, row_prm, true)){
                row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
                calc_qty_len(row_spec, row_ins_spec, rib.len);
                calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
              }
              row_spec = null;
            });

          }
          else if(row_ins_spec.count_calc_method == ПоШагам){
            const h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
            // (row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
            // row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление)
            if(row_ins_spec.step){
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
                calc_qty_len(row_spec, row_ins_spec, w);
                calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
              }
              row_spec = null;
            }
          }
          else{
            throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
          }
        }

        if(row_spec){
          // выполняем формулу
          if(!row_ins_spec.formula.empty()){
            const qty = row_ins_spec.formula.execute({
              ox: ox,
              elm: elm,
              cnstr: len_angl && len_angl.cnstr || 0,
              inset: (len_angl && len_angl.hasOwnProperty('cnstr')) ? len_angl.origin : $p.utils.blank.guid,
              row_ins: row_ins_spec,
              row_spec: row_spec,
              len: len_angl ? len_angl.len : _row.len
            });
            if(row_ins_spec.count_calc_method == ПоФормуле){
              row_spec.qty = qty;
            }
          }
          calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
        }
      })
    }

    /**
     * Возвращает толщину вставки
     *
     * @property thickness
     * @return {Number}
     */
    get thickness() {

      const {_data} = this;

      if(!_data.hasOwnProperty("thickness")){
        _data.thickness = 0;
        const nom = this.nom(null, true);
        if(nom && !nom.empty()){
          _data.thickness = nom.thickness;
        }
        else{
          this.specification.forEach((row) => {
            _data.thickness += row.nom.thickness;
          });
        }
      }

      return _data.thickness;
    }

    /**
     * Возвращает массив задействованных во вставке параметров
     * @property used_params
     * @return {Array}
     */
    get used_params() {
      const res = [];
      this.selection_params.each((row) => {
        if(!row.param.empty() && res.indexOf(row.param) == -1){
          res.push(row.param)
        }
      });
      return res;
    }

  }

})($p);

