/**
 * Дополнительные методы справочника Фурнитура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_furns
 */

/**
 * Методы менеджера фурнитуры
 */
$p.cat.furns.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
		}
	}
});

/**
 * Методы объекта фурнитуры
 */
$p.CatFurns.prototype.__define({

	/**
	 * Перезаполняет табчасть параметров указанного контура
	 */
	refill_prm: {
		value: function ({project, furn, cnstr}) {

			const fprms = project.ox.params;
			const {direction} = $p.job_prm.properties;

			// формируем массив требуемых параметров по задействованным в contour.furn.furn_set
			const aprm = furn.furn_set.add_furn_prm();
      aprm.sort((a, b) => {
        if (a.presentation > b.presentation) {
          return 1;
        }
        if (a.presentation < b.presentation) {
          return -1;
        }
        return 0;
      });

      // дозаполняем и приклеиваем значения по умолчанию
			aprm.forEach((v) => {

				// направления в табчасть не добавляем
				if(v == direction){
          return;
        }

        let prm_row, forcibly = true;
				fprms.find_rows({param: v, cnstr: cnstr}, (row) => {
					prm_row = row;
					return forcibly = false;
				});
				if(!prm_row){
          prm_row = fprms.add({param: v, cnstr: cnstr}, true);
        }

        // умолчания и скрытость по табчасти системы
        const {param} = prm_row;
        project._dp.sys.furn_params.each((row) => {
					if(row.param == param){
						if(row.forcibly || forcibly){
              prm_row.value = row.value;
            }
						prm_row.hide = row.hide || param.is_calculated;
						return false;
					}
				});

				// умолчания по связям параметров
        param.linked_values(param.params_links({
          grid: {selection: {cnstr: cnstr}},
          obj: {_owner: {_owner: project.ox}}
        }), prm_row);

			});

			// удаляем лишние строки
			const adel = [];
			fprms.find_rows({cnstr: cnstr}, (row) => {
				if(aprm.indexOf(row.param) == -1)
					adel.push(row);
			});
			adel.forEach((row) => fprms.del(row, true));

		}
	},

  /**
   * Вытягивает массив используемых фурнитурой и вложенными наборами параметров
   */
	add_furn_prm: {
		value: function (aprm = [], afurn_set = []) {

			// если параметры этого набора уже обработаны - пропускаем
			if(afurn_set.indexOf(this.ref)!=-1){
        return;
      }

			afurn_set.push(this.ref);

			this.selection_params.each((row) => aprm.indexOf(row.param)==-1 && !row.param.is_calculated && aprm.push(row.param));

			this.specification.each((row) => row.nom_set instanceof $p.CatFurns && row.nom_set.add_furn_prm(aprm, afurn_set));

			return aprm;

		}
	},

  handle_height_base: {
	  value: function () {

    }
  }

});

/**
 * Методы строки спецификации
 */
$p.CatFurnsSpecificationRow.prototype.__define({

  /**
   * Проверяет ограничения строки фурнитуры
   * @param contour {Contour}
   * @param cache {Object}
   */
  check_restrictions: {
    value: function (contour, cache) {

      const {elm, dop, handle_height_min, handle_height_max} = this;
      const {direction, h_ruch, cnstr} = contour;

      if(h_ruch < handle_height_min || (handle_height_max && h_ruch > handle_height_max)){
        return false;
      }

      // получаем связанные табличные части
      const {selection_params, specification_restrictions} = this._owner._owner;
      const prop_direction = $p.job_prm.properties.direction;

      let res = true;

      // по таблице параметров
      selection_params.find_rows({elm, dop}, (prm_row) => {
        let ok = false;
        if(prop_direction == prm_row.param){
          ok = direction == prm_row.value;
        }
        else{

          // TODO: учесть виды сравнений
          cache.ox.params.find_rows({
            cnstr: contour.cnstr,
            inset: $p.utils.blank.guid,
            param: prm_row.param,
            value: prm_row.value
          }, () => !(ok = true));

          // выполнение условия рассчитывает объект CchProperties
          ok = prm_row.param.check_condition({row_spec: this, prm_row, cnstr, ox: cache.ox});
        }

        if(!ok){
          return res = false;
        }
      });


      // по таблице ограничений
      if(res) {

        specification_restrictions.find_rows({elm, dop}, (row) => {
          let len;
          if (contour.is_rectangular) {
            len = (row.side == 1 || row.side == 3) ? cache.w : cache.h;
          }
          else {
            const elm = contour.profile_by_furn_side(row.side, cache);
            len = elm._row.len - 2 * elm.nom.sizefurn;
          }
          if (len < row.lmin || len > row.lmax) {
            return res = false;
          }
        });
      }

      return res;
    }
  }

});
