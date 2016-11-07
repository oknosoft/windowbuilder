/**
 * ### Дополнительные методы ПВХ Предопределенные элементы
 * Предопределенные элементы - аналог констант для хранения ссылочных и списочных настроек приложения
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cch_predefined_elmnts
 */

// Подписываемся на событие окончания загрузки локальных данных
$p.on({
	pouch_load_data_loaded: function predefined_elmnts_loaded() {

		$p.off(predefined_elmnts_loaded);

		// читаем элементы из pouchdb и создаём свойства
		$p.cch.predefined_elmnts.pouch_find_rows({ _raw: true, _top: 500, _skip: 0 })
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

					if(!row.is_folder && row.synonym && parents[row.parent] && !$p.job_prm[parents[row.parent]][row.synonym]){

						var _mgr, tnames;

						if(row.type.is_ref){
							tnames = row.type.types[0].split(".");
							_mgr = $p[tnames[0]][tnames[1]]
						}

						if(row.list == -1){

							$p.job_prm[parents[row.parent]].__define(row.synonym, {
								value: function () {
									var res = {};
									row.elmnts.forEach(function (row) {
										res[row.elm] = _mgr ? _mgr.get(row.value, false) : row.value;
									});
									return res;
								}()
							});

						}else if(row.list){

							$p.job_prm[parents[row.parent]].__define(row.synonym, {
								value: row.elmnts.map(function (row) {
									return _mgr ? _mgr.get(row.value, false) : row.value;
								})
							});

						}else{

							if($p.job_prm[parents[row.parent]].hasOwnProperty(row.synonym))
								delete $p.job_prm[parents[row.parent]][row.synonym];

							$p.job_prm[parents[row.parent]].__define(row.synonym, {
								value: _mgr ? _mgr.get(row.value, false) : row.value,
								configurable: true
							});
						}

					}
				});
			})
			.then(function () {

				// даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
				setTimeout(function () {
					$p.eve.callEvent("predefined_elmnts_inited");
				}, 100);


			});

	}
});


/**
 * Переопределяем геттер значения
 *
 * @property value
 * @override
 * @type {*}
 */
delete $p.CchPredefined_elmnts.prototype.value;
$p.CchPredefined_elmnts.prototype.__define({

	value: {
		get: function () {

			var mf = this.type,
				res = this._obj ? this._obj.value : "",
				mgr, ref;

			if(this._obj.is_folder)
				return "";

			if(typeof res == "object")
				return res;

			else if(mf.is_ref){
				if(mf.digits && typeof res === "number")
					return res;

				if(mf.hasOwnProperty("str_len") && !$p.utils.is_guid(res))
					return res;

				if(mgr = $p.md.value_mgr(this._obj, "value", mf)){
					if($p.utils.is_data_mgr(mgr))
						return mgr.get(res, false);
					else
						return $p.utils.fetch_type(res, mgr);
				}

				if(res){
					console.log(["value", mf, this._obj]);
					return null;
				}

			}else if(mf.date_part)
				return $p.utils.fix_date(this._obj.value, true);

			else if(mf.digits)
				return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty("str_len"));

			else if(mf.types[0]=="boolean")
				return $p.utils.fix_boolean(this._obj.value);

			else
				return this._obj.value || "";

			return this.characteristic.clr;
		},

		set: function (v) {

			if(this._obj.value === v)
				return;

			Object.getNotifier(this).notify({
				type: 'update',
				name: 'value',
				oldValue: this._obj.value
			});
			this._obj.value = $p.utils.is_data_obj(v) ? v.ref : v;
			this._data._modified = true;
		}
	}
});

/**
 * ### Форма элемента
 *
 * @method form_obj
 * @override
 * @param pwnd
 * @param attr
 * @returns {*}
 */
$p.cch.predefined_elmnts.form_obj = function(pwnd, attr){

	var o, wnd;

	return this.constructor.prototype.form_obj.call(this, pwnd, attr)
		.then(function (res) {
			if(res){
				o = res.o;
				wnd = res.wnd;
				return res;
			}
		});
};