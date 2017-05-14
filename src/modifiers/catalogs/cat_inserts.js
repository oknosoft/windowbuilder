/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
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

      const main_rows = [];
      let _nom;

      this.specification.find_rows({is_main_elm: true}, function (row) {
        main_rows.push(row);
      });

      if(this._data.nom)
        return this._data.nom;

      if(!main_rows.length && !strict && this.specification.count()){
        main_rows.push(this.specification.get(0))
      }

      if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts){
        if(main_rows[0].nom == this){
          _nom = $p.cat.nom.get()
        }
        else{
          _nom = main_rows[0].nom.nom()
        }
      }
      else if(main_rows.length){
        _nom = main_rows[0].nom
      }
      else{
        _nom = $p.cat.nom.get()
      }

      if(main_rows.length < 2){
        this._data.nom = _nom;
      }
      else{
        // TODO: реализовать фильтр
        this._data.nom = _nom;
      }

      return _nom;
    }

    /**
     * Возвращает атрибуты характеристики виртуальной продукции по вставке в контур
     */
    contour_attrs(contour) {

      var main_rows = [],
        res = {calc_order: contour.project.ox.calc_order};

      this.specification.find_rows({is_main_elm: true}, function (row) {
        main_rows.push(row);
        return false;
      });

      if(main_rows.length){
        var irow = main_rows[0],
          sizes = {},
          sz_keys = {},
          sz_prms = ['length', 'width', 'thickness'].map(function (name) {
            var prm = $p.job_prm.properties[name];
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
        }, function (row) {
          sizes[sz_keys[row.param.ref]] = row.value
        });

        if(Object.keys(sizes).length > 0){
          res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.s = ((res.x * res.y) / 1000000).round(3);
          res.z = sizes.thickness * (irow.coefficient * 1000 || 1);

        }else{

          if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()){
            irow.formula.execute({
              ox: contour.project.ox,
              contour: contour,
              inset: this,
              row_ins: irow,
              res: res
            });

          }else{
            res.x = contour.w + irow.sz;
            res.y = contour.h + irow.sz;
            res.s = ((res.x * res.y) / 1000000).round(3)

          }
        }
      }

      return res;

    }

    check_params({row_spec, elm, cnstr, origin, ox}) {
      let ok = true;

      // режем параметры по элементу
      this.selection_params.find_rows({elm: row_spec.elm}, (prm_row) => {
        // выполнение условия рассчитывает объект CchProperties
        ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
        if(!ok){
          return false;
        }
      });

      return ok;
    }

    /**
     * ПолучитьСпецификациюВставкиСФильтром
     * @param elm {BuilderElement|Object} - элемент, к которому привязана вставка
     * @param ox {CatCharacteristics} - текущая продукция
     * @param [is_high_level_call] {Boolean} - вызов верхнего уровня - специфично для стеклопакетов
     * @param [len_angl] {Object} - контекст размеров элемента
     * @param [own_row] {CatInsertsSpecificationRow} - родительская строка для вложенных вставок
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

      const {insert_type} = this;

      // для заполнений, можно переопределить состав верхнего уровня
      if(is_high_level_call && (insert_type == "Заполнение" || insert_type == "Стеклопакет" || insert_type == "ТиповойСтеклопакет")){

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
        if(!inset_check(row, elm, insert_type == $p.enm.inserts_types.Профиль, len_angl)){
          return;
        }

        // Проверяем параметры изделия, контура или элемента
        if(own_row && row.clr.empty() && !own_row.clr.empty()){
          row = fake_row(row);
          row.clr = own_row.clr;
        }
        if(!this.check_params({
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

