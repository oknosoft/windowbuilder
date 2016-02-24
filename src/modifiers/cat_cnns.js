/**
 * Дополнительные методы справочника Соединения
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_cnns
 */


$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.cnns,
			_nomcache = {};

		// приватные поля и методы

		// модификаторы

		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
				" left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
		};


		// публичные методы менеджера

		/**
		 * Возвращает массив соединений, доступный для сочетания номенклатур.
		 * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
		 * @param nom1 {_cat.nom}
		 * @param nom2 {_cat.nom}
		 * @param [cnn_type] {_enm.cnns}
		 * @return {Array}
		 */
		_mgr.nom_cnn = function(nom1, nom2, cnn_type){

			if(!nom1 || nom1.empty())
				return [];

			var onom1 = $p.is_data_obj(nom1) ? nom1 : $p.cat.nom.get(nom1), onom2,
				is_i = false, art1glass = false, art2glass = false,
				a1, a2;

			if(!nom2 || nom2.empty()){
				is_i = true;
				nom2 = {val: "i"};
			}
			else
				onom2 = $p.is_data_obj(nom2) ? nom2 : $p.cat.nom.get(nom2);

			if(!is_i){
				if($p.enm.elm_types.glasses.indexOf(onom1.elm_type) != -1)
					art1glass = true;
				else if($p.enm.elm_types.glasses.indexOf(onom2.elm_type) != -1)
					art2glass = true;
			}

			if(!_nomcache[nom1.ref])
				_nomcache[nom1.ref] = {};
			a1 = _nomcache[nom1.ref];
			if(!a1[nom2.ref]){
				a2 = (a1[nom2.ref] = []);
				// для всех элементов справочника соединения
				_mgr.each(function(оCnn){
					// если в строках соединяемых элементов есть наша - добавляем
					var is_nom1 = art1glass ? (оCnn.art1glass && onom1.thickness >= Number(оCnn.tmin) && onom1.thickness <= Number(оCnn.tmax)) : false,
						is_nom2 = art2glass ? (оCnn.art2glass && onom2.thickness >= Number(оCnn.tmin) && onom2.thickness <= Number(оCnn.tmax)) : false;

					оCnn["cnn_elmnts"].each(function(row){
						if(is_nom1 && is_nom2)
							return false;
						is_nom1 = is_nom1 || $p.is_equal(row.nom1, nom1);
						is_nom2 = is_nom2 || $p.is_equal(row.nom2, nom2);
					});
					if(is_nom1 && is_nom2){
						a2.push(оCnn);
					}
				});
			}

			if(cnn_type){
				var tmp = a1[nom2.ref], res = [], types;

				if(Array.isArray(cnn_type))
					types = cnn_type;
				else if($p.enm.cnn_types.acn.a.indexOf(cnn_type) != -1)
					types = $p.enm.cnn_types.acn.a;
				else
					types = [cnn_type];

				tmp.forEach(function (c) {
					if(types.indexOf(c.cnn_type) != -1)
						res.push(c);
				});
				return res;
			}

			return a1[nom2.ref];
		};

		/**
		 * Возвращает соединение между элементами
		 * @param elm1
		 * @param elm2
		 * @param [cnn_types] {Array}
		 * @param [curr_cnn] {_cat.cnns}
		 */
		_mgr.elm_cnn = function(elm1, elm2, cnn_types, curr_cnn){

			if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type)!=-1)){
				// если установленное ранее соединение проходит по типу, нового не ищем
				// TODO: проверить геометрию
				return curr_cnn;
			}

			var cnns = _mgr.nom_cnn(elm1 ? elm1.nom : null, elm2 ? elm2.nom : null, cnn_types);

			// для примера подставляем первое попавшееся соединение
			if(cnns.length)
				return cnns[0];
			else{
				// TODO: возможно, надо вернуть соединение с пустотой
			}
		};



		// публичные методы объекта

		_mgr._obj_сonstructor.prototype.__define({

			/**
			 * Возвращает основную строку спецификации соединения между элементами
			 */
			main_row: {
				value: function (elm) {

					var ares, nom = elm.nom;

					// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
					if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){
						var art12;
						if(elm.orientation == $p.enm.orientations.Вертикальная)
							art12 = $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1");
						else
							art12 = $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2");

						ares = this.specification.find_rows({nom: art12});
						if(ares.length)
							return ares[0]._row;
					}

					// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
					if(this.cnn_elmnts.find_rows({nom1: nom}).length){
						ares = this.specification.find_rows({nom: $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1")});
						if(ares.length)
							return ares[0]._row;
					}
					if(this.cnn_elmnts.find_rows({nom2: nom}).length){
						ares = this.specification.find_rows({nom: $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2")});
						if(ares.length)
							return ares[0]._row;
					}
					ares = this.specification.find_rows({nom: nom});
					if(ares.length)
						return ares[0]._row;

				},
				enumerable: false
			}
		});

	}
);
