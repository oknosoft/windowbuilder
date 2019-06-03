/**
 * Дополнительные методы справочника Системы (Параметры продукции)
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author Evgeniy Malyarov
 * @module cat_production_params
 */

$p.cat.production_params.__define({

	/**
	 * возвращает массив доступных для данного свойства значений
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param is_furn {boolean} - интересуют свойства фурнитуры или объекта
	 * @return {Array}
	 */
	slist: function(prop, is_furn){
		var res = [], rt, at, pmgr,
			op = this.get(prop);

		if(op && op.type.is_ref){
			// параметры получаем из локального кеша
			for(rt in op.type.types)
				if(op.type.types[rt].indexOf(".") > -1){
					at = op.type.types[rt].split(".");
					pmgr = $p[at[0]][at[1]];
					if(pmgr){
						if(pmgr.class_name=="enm.open_directions")
							pmgr.forEach(function(v){
								if(v.name!=$p.enm.tso.folding)
									res.push({value: v.ref, text: v.synonym});
							});
						else
							pmgr.find_rows({owner: prop}, function(v){
								res.push({value: v.ref, text: v.presentation});
							});
					}
				}
		}
		return res;
	}
});

$p.CatProduction_params.prototype.__define({

	/**
	 * возвращает доступные в данной системе элементы
	 * @property noms
	 * @for Production_params
	 */
	noms: {
		get(){
			const noms = [];
			this.elmnts._obj.forEach(({nom}) => !$p.utils.is_empty_guid(nom) && noms.indexOf(nom) == -1 && noms.push(nom));
			return noms;
		}
	},

  /**
   * возвращает доступные в данной системе фурнитуры
   * данные получает из справчоника СвязиПараметров, где ведущий = текущей системе и ведомый = фурнитура
   * @property furns
   * @for Production_params
   */
  furns: {
    value(ox){
      const {furn} = $p.job_prm.properties;
      const {furns} = $p.cat;
      const list = [];
      if(furn){
        const links = furn.params_links({
          grid: {selection: {cnstr: 0}},
          obj: {_owner: {_owner: ox}}
        });
        if(links.length){
          // собираем все доступные значения в одном массиве
          links.forEach((link) => link.values._obj.forEach(({value, by_default, forcibly}) => {
            const v = furns.get(value);
            v && list.push({furn: v, by_default, forcibly});
          }));
        }
      }
      return list;
    }
  },

	/**
	 * возвращает доступные в данной системе элементы (вставки)
	 * @property inserts
	 * @for Production_params
	 * @param elm_types - допустимые типы элементов
	 * @param by_default {Boolean|String} - сортировать по признаку умолчания или по наименованию вставки
	 * @return Array.<_cat.inserts>
	 */
	inserts: {
		value(elm_types, by_default){
			var __noms = [];
			if(!elm_types)
				elm_types = $p.enm.elm_types.rama_impost;

			else if(typeof elm_types == "string")
				elm_types = $p.enm.elm_types[elm_types];

			else if(!Array.isArray(elm_types))
				elm_types = [elm_types];

			this.elmnts.forEach((row) => {
				if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
					(by_default == "rows" || !__noms.some((e) => row.nom == e.nom)))
					__noms.push(row);
			});

			if(by_default == "rows")
				return __noms;

			__noms.sort(function (a, b) {

				if(by_default){

					if (a.by_default && !b.by_default)
						return -1;
					else if (!a.by_default && b.by_default)
						return 1;
					else
						return 0;

				}else{
					if (a.nom.name < b.nom.name)
						return -1;
					else if (a.nom.name > b.nom.name)
						return 1;
					else
						return 0;
				}
			});
			return __noms.map((e) => e.nom);
		}
	},

	/**
	 * @method refill_prm
	 * @for cat.Production_params
	 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
	 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
	 */
	refill_prm: {
		value(ox, cnstr = 0, force, project) {

			const prm_ts = !cnstr ? this.product_params : this.furn_params;
			const adel = [];
			const auto_align = ox.calc_order.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон && $p.job_prm.properties.auto_align;
			const {params} = ox;

			function add_prm(proto) {
        let row;
        params.find_rows({cnstr: cnstr, param: proto.param}, (_row) => {
          row = _row;
          return false;
        });

        // если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
        if(!row){
          if(cnstr){
            return;
          }
          row = params.add({cnstr: cnstr, param: proto.param, value: proto.value});
        }

        const links = proto.param.params_links({grid: {selection: {cnstr}}, obj: row});
        const hide = proto.hide || links.some((link) => link.hide);
        if(row.hide != hide){
          row.hide = hide;
        }

        if(proto.forcibly && row.value != proto.value){
          row.value = proto.value;
        }
      }

			// если в характеристике есть лишние параметры - удаляем
			if(!cnstr){
        params.find_rows({cnstr: cnstr}, (row) => {
				  const {param} = row;
					if(param !== auto_align && prm_ts.find_rows({param}).length == 0){
            adel.push(row);
          }
				});
				adel.forEach((row) => params.del(row));
			}

			// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
			prm_ts.forEach(add_prm);

			// для шаблонов, добавляем параметр автоуравнивание
      !cnstr && auto_align && add_prm({param: auto_align, value: '', hide: false});

      // устанавливаем систему и номенклатуру продукции
			if(!cnstr){
				ox.sys = this;
				ox.owner = ox.prod_nom;

				// если текущая фурнитура недоступна для данной системы - меняем
        const furns = this.furns(ox);

				// одновременно, перезаполним параметры фурнитуры
				ox.constructions.forEach((row) => {
          if(!row.furn.empty()) {
            let changed = force;
            // если для системы через связи параметров ограничен список фурнитуры...
            if(furns.length) {
              if(furns.some((frow) => {
                if(frow.forcibly) {
                  row.furn = frow.furn;
                  return changed = true;
                }
              })) {
                ;
              }
              else if(furns.some((frow) => row.furn === frow.furn)) {
                ;
              }
              else if(furns.some((frow) => {
                if(frow.by_default) {
                  row.furn = frow.furn;
                  return changed = true;
                }
              })) {
                ;
              }
              else {
                row.furn = furns[0].furn;
                changed = true;
              }
            }

            if(changed) {
              if(!project && paper) {
                project = paper.project;
              }
              const contour = project && project.getItem({cnstr: row.cnstr});
              if(contour) {
                row.furn.refill_prm(contour);
                contour.notify(contour, 'furn_changed');
              }
              else {
                ox.sys.refill_prm(ox, row.cnstr);
              }
            }
          }
        });
			}
		}
	}

});

