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

  /**
   * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
   * @param contour {Contour}
   * @param cache {Object}
   * @param [exclude_dop] {Boolean}
   */
  get_spec: {
	  value: function (contour, cache, exclude_dop) {

      const res = $p.dp.buyers_order.create().specification;
      const {ox} = contour.project;

      // бежим по всем строкам набора
      this.specification.find_rows({dop: 0}, (row_furn) => {

        // проверяем, проходит ли строка
        if(!row_furn.check_restrictions(contour, cache)){
          return;
        }

        // ищем строки дополнительной спецификации
        if(!exclude_dop){
          this.specification.find_rows({is_main_specification_row: false, elm: row_furn.elm}, (dop_row) => {

            if(!dop_row.check_restrictions(contour, cache)){
              return;
            }

            // расчет координаты и (или) визуализации
            if(dop_row.is_procedure_row){

              const invert = contour.direction == $p.enm.open_directions.Правое,
                elm = contour.profile_by_furn_side(dop_row.side, cache),
                len = elm._row.len,
                sizefurn = elm.nom.sizefurn,
                dx0 = (len - elm.data._len) / 2,
                dx1 = $p.job_prm.builder.add_d ? sizefurn : 0,
                faltz = len - 2 * sizefurn;

              let invert_nearest = false, coordin = 0;

              if(dop_row.offset_option == $p.enm.offset_options.Формула){
                if(!dop_row.formula.empty()){
                  coordin = dop_row.formula.execute({ox, elm, contour, len, sizefurn, dx0, dx1, faltz, invert, dop_row});
                }
              }
              else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
                coordin = faltz + dop_row.contraction;
              }
              else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
                // строим горизонтальную линию от нижней границы контура, находим пересечение и offset
                const {bounds} = contour;
                const by_side = contour.profiles_by_side();
                const hor = (elm == by_side.top || elm == by_side.bottom) ?
                  new paper.Path({
                    insert: false,
                    segments: [[bounds.left + contour.h_ruch, bounds.top - 200], [bounds.left + contour.h_ruch, bounds.bottom + 200]]
                  }) :
                  new paper.Path({
                    insert: false,
                    segments: [[bounds.left - 200, bounds.bottom - contour.h_ruch], [bounds.right + 200, bounds.bottom - contour.h_ruch]]
                  });

                coordin = elm.generatrix.getOffsetOf(elm.generatrix.intersect_point(hor)) -
                  elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));
              }
              else{

                if(invert){
                  if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                    coordin = dop_row.contraction;
                  }
                  else{
                    coordin = len - dop_row.contraction;
                  }
                }
                else{
                  if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                    coordin = len - dop_row.contraction;
                  }
                  else{
                    coordin = dop_row.contraction;
                  }
                }
              }

              const procedure_row = res.add(dop_row);
              procedure_row.origin = this;
              procedure_row.handle_height_min = elm.elm;
              procedure_row.handle_height_max = contour.cnstr;
              procedure_row.coefficient = coordin;

              return;
            }
            else if(!dop_row.quantity){
              return;
            }

            // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
            if(dop_row.is_set_row){
              dop_row.nom_set.get_spec(contour, cache).each((sub_row) => {
                if(sub_row.is_procedure_row){
                  res.add(sub_row);
                }
                else if(sub_row.quantity) {
                  res.add(sub_row).quantity = (row_furn.quantity || 1) * (dop_row.quantity || 1) * sub_row.quantity;
                }
              });
            }
            else{
              res.add(dop_row).origin = this;
            }
          });
        }

        // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
        if(row_furn.is_set_row){
          row_furn.nom_set.get_spec(contour, cache, exclude_dop).each((sub_row) => {
            if(sub_row.is_procedure_row){
              res.add(sub_row);
            }
            else if(!sub_row.quantity){
              return;
            }
            res.add(sub_row).quantity = (row_furn.quantity || 1) * sub_row.quantity;
          });
        }
        else{
          if(row_furn.quantity){
            const row_spec = res.add(row_furn);
            row_spec.origin = this;
            if(!row_furn.formula.empty()){
              row_furn.formula.execute({ox, contour, row_furn, row_spec});
            }
          }
        }
      });

      return res;
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
        // выполнение условия рассчитывает объект CchProperties
        const ok = (prop_direction == prm_row.param) ?
          direction == prm_row.value : prm_row.param.check_condition({row_spec: this, prm_row, cnstr, ox: cache.ox});
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
