/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_formulas
 * Created 17.04.2016
 */

$p.modifiers.push(
	function($p){

		// Подписываемся на событие окончания загрузки локальных данных
		var _mgr = $p.cat.formulas,
			on_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {
				
				$p.eve.detachEvent(on_data_loaded);

				// читаем элементы из pouchdb и создаём формулы
				_mgr.pouch_find_rows({ _top: 500, _skip: 0 })
					.then(function (rows) {

						rows.forEach(function (row) {
							if(row.parent == _mgr.predefined("printing_plates")){
								row.params.find_rows({param: "destination"}, function (dest) {
									var dmgr = $p.md.mgr_by_class_name(dest.value);
									if(dmgr){
										if(!dmgr._printing_plates)
											dmgr._printing_plates = {};
										dmgr._printing_plates["prn_" + row.id] = row;
									}
								})
							}
						});
						
					});

		});

		_mgr._obj_constructor.prototype.__define({
			
			execute: {
				value: function (obj) {

					// создаём функцию из текста формулы
					if(!this._data._formula && this.formula)
						this._data._formula = (new Function("obj", this.formula)).bind(this);

					// создаём blob из шаблона пустой страницы
					if(!($p.injected_data['view_blank.html'] instanceof Blob))
						$p.injected_data['view_blank.html'] = new Blob([$p.injected_data['view_blank.html']], {type: 'text/html'});


					if(this.parent == _mgr.predefined("printing_plates")){

						// получаем HTMLDivElement с отчетом
						return this._data._formula(obj)

							// показываем отчет в отдельном окне
							.then(function (doc) {
								var url = window.URL.createObjectURL($p.injected_data['view_blank.html']),
									wnd_print = window.open(
										url, "wnd_print", "fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes");

								if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
									wnd_print.moveTo(0,0);
									wnd_print.resizeTo(screen.availWidth, screen.availHeight);
								}

								wnd_print.onload = function(e) {
									window.URL.revokeObjectURL(url);
									wnd_print.document.body.appendChild(doc.content);

									if(doc.title)
										wnd_print.document.title = doc.title;

									wnd_print.print();
								};

								return wnd_print;

							});

					}else
						return this._data._formula(obj)


				}
			},

			_template: {
				get: function () {
					if(!this._data._template)
						this._data._template = new $p.SpreadsheetDocument(this.template);

					return this._data._template;
				}
			}
		});

	}
);