/**
 * Дополнительные методы справочника Контрагенты
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_partners
 */

$p.modifiers.push(
	function($p){

		// Подписываемся на событие окончания загрузки локальных данных
		var pouch_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {

			$p.eve.detachEvent(pouch_data_loaded);

			// читаем элементы из pouchdb и создаём свойства
			$p.cch.predefined_elmnts.pouch_find_rows({ _raw: true, _top: 300, _skip: 0 })
				.then(function (rows) {

					var parents = {};

					rows.forEach(function (row) {
						if(row.is_folder && row.synonym){
							var ref = row._id.split("|")[1];
							parents[ref] = row.synonym;
							$p.job_prm.__define(row.synonym, { value: {} });
						}
					});

					rows.forEach(function (row) {

						if(!row.is_folder && row.synonym){

							var _mgr, tnames;
							if(row.type.is_ref){
								tnames = row.type.types[0].split(".");
								_mgr = $p[tnames[0]][tnames[1]]
							}

							if(row.list){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: row.elmnts.map(function (row) {
										return _mgr ? _mgr.get(row.value, false) : row.value;
									})
								});
							}
							else{
								$p.job_prm[parents[row.parent]].__define(row.synonym, { value: _mgr ? _mgr.get(row.value, false) : row.value });
							}

						}
					});
				})
				.then(function () {
					
					// рассчеты, помеченные, как шаблоны, загрузим в память заранее
					setTimeout(function () {
						$p.job_prm.builder.base_block.forEach(function (o) {
							o.load();
						});
					}, 500);

					$p.eve.callEvent("predefined_elmnts_inited");
					
				});
			
		});

	}
);