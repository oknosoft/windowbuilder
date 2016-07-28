/**
 * Дополнительные методы справочника Фурнитура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_furns
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

$p.CatFurns.prototype.__define({

	/**
	 * Перезаполняет табчасть параметров указанного контура
	 */
	refill_prm: {
		value: function (contour) {

			var osys = contour.project._dp.sys,
				fprms = contour.project.ox.params,
				prm_direction = $p.job_prm.properties.direction;

			// формируем массив требуемых параметров по задействованным в contour.furn.furn_set
			var aprm = contour.furn.furn_set.add_furn_prm();

			// дозаполняем и приклеиваем значения по умолчанию
			var prm_row, forcibly;
			aprm.forEach(function(v){

				// направления в табчасть не добавляем
				if(v == prm_direction)
					return;

				prm_row = null;
				forcibly = true;
				fprms.find_rows({param: v, cnstr: contour.cnstr}, function (row) {
					prm_row = row;
					return forcibly = false;
				});
				if(!prm_row)
					prm_row = fprms.add({param: v, cnstr: contour.cnstr}, true);

				osys.furn_params.each(function(row){
					if(row.param == prm_row.param){
						if(row.forcibly || forcibly)
							prm_row.value = row.value;
						prm_row.hide = row.hide;
						return false;
					}
				});
			});

			// удаляем лишние строки
			var adel = [];
			fprms.find_rows({cnstr: contour.cnstr}, function (row) {
				if(aprm.indexOf(row.param) == -1)
					adel.push(row);
			});
			adel.forEach(function (row) {
				fprms.del(row, true);
			});


		},
		enumerable: false
	},

	add_furn_prm: {
		value: function (aprm, afurn_set) {

			if(!aprm)
				aprm = [];

			if(!afurn_set)
				afurn_set = [];

			// если параметры этого набора уже обработаны - пропускаем
			if(afurn_set.indexOf(this.ref)!=-1)
				return;

			afurn_set.push(this.ref);

			this.selection_params.each(function(row){
				if(aprm.indexOf(row.param)==-1)
					aprm.push(row.param);
			});

			this.specification.each(function(row){
				if(row.nom_set && row.nom_set._manager === $p.cat.furns)
					row.nom_set.add_furn_prm(aprm, afurn_set);
			});

			return aprm;

		},
		enumerable: false
	}

});