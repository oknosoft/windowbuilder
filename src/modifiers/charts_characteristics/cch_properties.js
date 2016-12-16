/**
 * ### Дополнительные методы плана видов характеристик _Свойства объектов_
 * аналог подсистемы _Свойства_ БСП
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
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
      return $p.job_prm.properties.calculated.indexOf(this) != -1;
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
   * ### Дополняет отбор фильтром по параметрам выбора
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

      var ts = attr.obj._owner,
        ox = ts._owner,
        selection = attr.grid.selection._clone();
      if(selection.hasOwnProperty("hide")){
        delete selection.hide;
      }
      var  prms = ts.find_rows(selection);

      // для всех возможных связей параметров
      this._params_links.forEach(function (link) {
        var ok = true;
        // для всех записей ключа параметров
        link.master.params.forEach(function (row) {
          ok = prms.some(function (prm) {
            return prm.property == prm.property && prm.value == prm.value;
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
            link.values._obj.forEach(function (row) {
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
