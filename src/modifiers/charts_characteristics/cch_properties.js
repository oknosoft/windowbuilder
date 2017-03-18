/**
 * ### Дополнительные методы плана видов характеристик _Свойства объектов_
 * аналог подсистемы _Свойства_ БСП
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cch_properties
 */


$p.cch.properties.__define({

	/**
	 * ### Проверяет заполненность обязательных полей
	 *
	 * @method check_mandatory
	 * @override
	 * @param prms {Array}
	 * @param title {String}
	 * @return {Boolean}
	 */
	check_mandatory: {
		value: function(prms, title){

			var t, row;

			// проверяем заполненность полей
			for(t in prms){
				row = prms[t];
				if(row.param.mandatory && (!row.value || row.value.empty())){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.bld_empty_param + row.param.presentation,
						title: title || $p.msg.bld_title});
					return true;
				}
			}
		}
	},

	/**
	 * ### Возвращает массив доступных для данного свойства значений
	 *
	 * @method slist
	 * @override
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
	 * @return {Array}
	 */
	slist: {
		value: function(prop, ret_mgr){

			var res = [], rt, at, pmgr, op = this.get(prop);

			if(op && op.type.is_ref){
				// параметры получаем из локального кеша
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){

							if(ret_mgr)
								ret_mgr.mgr = pmgr;

							if(pmgr.class_name=="enm.open_directions")
								pmgr.get_option_list().forEach(function(v){
									if(v.value && v.value!=$p.enm.tso.folding)
										res.push(v);
								});

							else if(pmgr.class_name.indexOf("enm.")!=-1 || !pmgr.metadata().has_owners)
								res = pmgr.get_option_list();

							else
								pmgr.find_rows({owner: prop}, function(v){
									res.push({value: v.ref, text: v.presentation});
								});
						}
					}
			}
			return res;
		}
	}

});

$p.CchProperties.prototype.__define({

  /**
   * ### Является ли значение параметра вычисляемым
   *
   * @property is_calculated
   * @type {Boolean}
   */
  is_calculated: {
    get: function () {
      return ($p.job_prm.properties.calculated || []).indexOf(this) != -1;
    }
  },

  /**
   * ### Рассчитывает значение вычисляемого параметра
   * @param obj {Object}
   * @param [obj.row]
   * @param [obj.elm]
   * @param [obj.ox]
   */
  calculated_value: {
    value: function (obj) {
      if(!this._calculated_value){
        if(this._formula){
          this._calculated_value = $p.cat.formulas.get(this._formula);
        }else{
          return;
        }
      }
      return this._calculated_value.execute(obj)
    }
  },

  /**
   * ### Проверяет условие в строке отбора
   */
  check_condition: {
    value: function ({spec_row, prm_row, elm, cnstr, origin, ox, calc_order}) {

      const {is_calculated} = this;

      // значение параметра
      const val = is_calculated ? this.calculated_value({
          row: spec_row,
          elm: elm,
          cnstr: cnstr || 0,
          ox: ox,
          calc_order: calc_order
        }) : this.extract_value(prm_row);

      let ok = false;

      // если сравнение на равенство - решаем в лоб, если вычисляемый параметр типа массив - выясняем вхождение значения в параметр
      if(ox && !Array.isArray(val) && (prm_row.comparison_type.empty() || prm_row.comparison_type == $p.enm.comparison_types.eq)){
        if(is_calculated){
          ok = val == prm_row.value;
        }
        else{
          ox.params.find_rows({
            cnstr: cnstr || 0,
            inset: origin || $p.utils.blank.guid,
            param: this,
            value: val
          }, () => {
            ok = true;
            return false;
          });
        }
      }
      // вычисляемый параметр - его значение уже рассчитано формулой (val) - сравниваем со значением в строке ограничений
      else if(is_calculated){

        const value = this.extract_value(prm_row);

        switch(prm_row.comparison_type) {

          case $p.enm.comparison_types.ne:
            ok = val != value;
            break;

          case $p.enm.comparison_types.gt:
            ok = val > value;
            break;

          case $p.enm.comparison_types.gte:
            ok = val >= value;
            break;

          case $p.enm.comparison_types.lt:
            ok = val < value;
            break;

          case $p.enm.comparison_types.lte:
            ok = val <= value;
            break;

          case $p.enm.comparison_types.nin:
            if(Array.isArray(val) && !Array.isArray(value)){
              ok = val.indexOf(value) == -1;
            }
            else if(Array.isArray(value) && !Array.isArray(val)){
              ok = value.indexOf(val) == -1;
            }
            break;

          case $p.enm.comparison_types.in:
            if(Array.isArray(val) && !Array.isArray(value)){
              ok = val.indexOf(value) != -1;
            }
            else if(Array.isArray(value) && !Array.isArray(val)){
              ok = value.indexOf(val) != -1;
            }
            break;

          case $p.enm.comparison_types.inh:
            ok = $p.utils.is_data_obj(val) ? val.in_hierarchy(value) : val == value;
            break;

          case $p.enm.comparison_types.ninh:
            ok = $p.utils.is_data_obj(val) ? !val.in_hierarchy(value) : val != value;
            break;
        }
      }
      // параметр явно указан в табчасти параметров изделия
      else{
        ox.params.find_rows({
          cnstr: cnstr || 0,
          inset: origin || $p.utils.blank.guid,
          param: this
        }, ({value}) => {
          // value - значение из строки параметра текущей продукции, val - знаяение из параметров отбора
          switch(prm_row.comparison_type) {

            case $p.enm.comparison_types.ne:
              ok = value != val;
              break;

            case $p.enm.comparison_types.gt:
              ok = value > val;
              break;

            case $p.enm.comparison_types.gte:
              ok = value >= val;
              break;

            case $p.enm.comparison_types.lt:
              ok = value < val;
              break;

            case $p.enm.comparison_types.lte:
              ok = value <= val;
              break;

            case $p.enm.comparison_types.nin:
              if(Array.isArray(val) && !Array.isArray(value)){
                ok = val.indexOf(value) == -1;
              }
              else if(Array.isArray(value) && !Array.isArray(val)){
                ok = value.indexOf(val) == -1;
              }
              break;

            case $p.enm.comparison_types.in:
              if(Array.isArray(val) && !Array.isArray(value)){
                ok = val.indexOf(value) != -1;
              }
              else if(Array.isArray(value) && !Array.isArray(val)){
                ok = value.indexOf(val) != -1;
              }
              break;

            case $p.enm.comparison_types.inh:
              ok = $p.utils.is_data_obj(value) ? value.in_hierarchy(val) : val == value;
              break;

            case $p.enm.comparison_types.ninh:
              ok = $p.utils.is_data_obj(value) ? !value.in_hierarchy(val) : val != value;
              break;
          }

          return false;
        });
      }
      return ok;
    }
  },

  extract_value: {
    value: function ({comparison_type, txt_row, value}) {

      switch(comparison_type) {

        case $p.enm.comparison_types.in:
        case $p.enm.comparison_types.nin:

          try{
            const arr = JSON.parse(txt_row);
            const {types} = this.type;
            if(types.length == 1){
              const mgr = $p.md.mgr_by_class_name(types[0]);
              return arr.map((ref) => mgr.get(ref, false));
            }
            return arr;
          }
          catch(err){
            return value;
          }

        default:
          return value;
      }
    }
  },

  /**
   * ### Дополняет отбор фильтром по параметрам выбора
   * Используется в полях ввода экранных форм
   * @param filter {Object} - дополняемый фильтр
   * @param attr {Object} - атрибуты OCombo
   */
  filter_params_links: {
    value: function (filter, attr) {

      // первым делом, выясняем, есть ли ограничитель на текущий параметр
      if(!this.hasOwnProperty("_params_links")){
        this._params_links = $p.cat.params_links.find_rows({slave: this})
      }
      if(!this._params_links.length){
        return;
      }

      // для всех возможных связей параметров
      this._params_links.forEach((link) => {
        let ok = true;
        // для всех записей ключа параметров
        link.master.params.forEach((row) => {

          // выполнение условия рассчитывает объект CchProperties
          ok = row.property.check_condition({
            cnstr: attr.grid.selection.cnstr,
            ox: attr.obj._owner._owner,
            prm_row: row,
          });
          if(!ok){
            return false;
          }

        });
        // если ключ найден в параметрах, добавляем фильтр
        if(ok){
          if(!filter.ref){
            filter.ref = {in: []}
          }
          if(filter.ref.in){
            link.values._obj.forEach((row) => {
              if(filter.ref.in.indexOf(row.value) == -1){
                filter.ref.in.push(row.value);
              }
            });
          }
        }
      });

    }
  }

});
