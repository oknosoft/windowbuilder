/**
 * ### Дополнительные методы справочника _Соединения_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 * @module cat_cnns
 * Created 23.12.2015
 */

(function($p){

	var _mgr = $p.cat.cnns,
		_nomcache = {};

	_mgr.sql_selection_list_flds = function(initial_value){
		return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
			" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
			" left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
	};


	/**
	 * Возвращает массив соединений, доступный для сочетания номенклатур.
	 * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
	 * @param nom1 {_cat.nom|BuilderElement}
	 * @param nom2 {_cat.nom|BuilderElement}
	 * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
	 * @return {Array}
	 */
	_mgr.nom_cnn = function(nom1, nom2, cnn_types){

		// если второй элемент вертикальный - меняем местами эл 1-2 при поиске
		if(nom1 instanceof $p.Editor.Profile &&
			nom2 instanceof $p.Editor.Profile &&
			cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
			nom1.orientation != $p.enm.orientations.Вертикальная &&
			nom2.orientation == $p.enm.orientations.Вертикальная ){

			return _mgr.nom_cnn(nom2, nom1, cnn_types);
		}


		var onom1, onom2,
			is_i = false, art1glass = false, art2glass = false,
			a1, a2, ref1,
			thickness1, thickness2;

		if(nom1 instanceof $p.Editor.BuilderElement){
			onom1 = nom1.nom;

		}else if($p.utils.is_data_obj(nom1)){
			onom1 = nom1;

		}else{
			onom1 = $p.cat.nom.get(nom1);

		}

		if(!onom1 || onom1.empty())
			ref1 = nom1.ref;
		else
			ref1 = onom1.ref;


		if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
			is_i = true;
			onom2 = nom2 = $p.cat.nom.get();

		}else{

			if(nom2 instanceof $p.Editor.BuilderElement){
				onom2 = nom2.nom;

			}else if($p.utils.is_data_obj(nom2)){
				onom2 = nom2;

			}else{
				onom2 = $p.cat.nom.get(nom2);

			}
		}

		if(!is_i){
			if(nom1 instanceof $p.Editor.Filling){
				art1glass = true;
				thickness1 = nom1.thickness;

			}else if(nom2 instanceof $p.Editor.Filling){
				art2glass = true;
				thickness2 = nom2.thickness;
			}

		}

		if(!_nomcache[ref1])
			_nomcache[ref1] = {};
		a1 = _nomcache[ref1];
		if(!a1[onom2.ref]){
			a2 = (a1[onom2.ref] = []);
			// для всех элементов справочника соединения
			_mgr.each(function(оCnn){
				// если в строках соединяемых элементов есть наша - добавляем
				var is_nom1 = art1glass ? (оCnn.art1glass && thickness1 >= Number(оCnn.tmin) && thickness1 <= Number(оCnn.tmax)) : false,
					is_nom2 = art2glass ? (оCnn.art2glass && thickness2 >= Number(оCnn.tmin) && thickness2 <= Number(оCnn.tmax)) : false;

				оCnn.cnn_elmnts.each(function(row){
					if(is_nom1 && is_nom2)
						return false;
					is_nom1 = is_nom1 || $p.utils.is_equal(row.nom1, onom1);
					is_nom2 = is_nom2 || $p.utils.is_equal(row.nom2, onom2);
				});
				if(is_nom1 && is_nom2){
					a2.push(оCnn);
				}
			});
		}

		if(cnn_types){
			var tmp = a1[onom2.ref], res = [], types;

			if(Array.isArray(cnn_types))
				types = cnn_types;
			else if($p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1)
				types = $p.enm.cnn_types.acn.a;
			else
				types = [cnn_types];

			tmp.forEach(function (c) {
				if(types.indexOf(c.cnn_type) != -1)
					res.push(c);
			});
			return res;
		}

		return a1[onom2.ref];
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

		var cnns = _mgr.nom_cnn(elm1, elm2, cnn_types);

		// для примера подставляем первое попавшееся соединение
		if(cnns.length)
			return cnns[0];
		else{
			// TODO: возможно, надо вернуть соединение с пустотой
		}
	};

})($p);

// публичные методы объекта
$p.CatCnns.prototype.__define({

	/**
	 * Возвращает основную строку спецификации соединения между элементами
	 */
	main_row: {
		value: function (elm) {

			var ares, nom = elm.nom;

			// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
			if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

				var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

				ares = this.specification.find_rows({nom: art12});
				if(ares.length)
					return ares[0]._row;
			}

			// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
			if(this.cnn_elmnts.find_rows({nom1: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
				if(ares.length)
					return ares[0]._row;
			}
			if(this.cnn_elmnts.find_rows({nom2: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
				if(ares.length)
					return ares[0]._row;
			}
			ares = this.specification.find_rows({nom: nom});
			if(ares.length)
				return ares[0]._row;

		}
	},

	/**
	 * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
	 */
	check_nom2: {
		value: function (nom) {
			var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
			return this.cnn_elmnts._obj.some(function (row) {
				return row.nom == ref;
			})
		}
	}

});
