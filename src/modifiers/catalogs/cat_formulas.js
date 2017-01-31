/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

$p.on({

	pouch_load_data_loaded: function cat_formulas_data_loaded () {

		$p.off(cat_formulas_data_loaded);

		// читаем элементы из pouchdb и создаём формулы
		$p.cat.formulas.pouch_find_rows({ _top: 500, _skip: 0 })
			.then(function (rows) {

				rows.forEach(function (row) {

					// формируем списки печатных форм и внешних обработок
					if(row.parent == $p.cat.formulas.predefined("printing_plates")){
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

	}
});

$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj) {

			// создаём функцию из текста формулы
			if(!this._data._formula && this.formula){
        this._data._formula = (new Function("obj", this.formula)).bind(this);
      }

      const {_formula} = this._data;

			if(this.parent == $p.cat.formulas.predefined("printing_plates")){

        if(!_formula){
          $p.msg.show_msg({
            title: $p.msg.bld_title,
            type: "alert-error",
            text: `Ошибка в формуле<br /><b>${this.name}</b>`
          });
          return Promise.resolve();
        }

				// создаём blob из шаблона пустой страницы
				if(!($p.injected_data['view_blank.html'] instanceof Blob)){
          $p.injected_data['view_blank.html'] = new Blob([$p.injected_data['view_blank.html']], {type: 'text/html'});
        }

				// получаем HTMLDivElement с отчетом
				return _formula(obj)

				// показываем отчет в отдельном окне
					.then(function (doc) {

						if(doc && doc.content instanceof HTMLElement){

							const url = window.URL.createObjectURL($p.injected_data['view_blank.html']);

							try{
                const	wnd_print = window.open(
                  url, "wnd_print", "fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes");

                if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
                  wnd_print.moveTo(0,0);
                  wnd_print.resizeTo(screen.availWidth, screen.availHeight);
                }

                wnd_print.onload = function(e) {
                  window.URL.revokeObjectURL(url);
                  wnd_print.document.body.appendChild(doc.content);
                  if(doc.title){
                    wnd_print.document.title = doc.title;
                  }
                  wnd_print.print();
                };

                return wnd_print;
              }
              catch(err){
                $p.msg.show_msg({
                  title: $p.msg.bld_title,
                  type: "alert-error",
                  text: err.message.match("outerWidth") ?
                    "Ошибка открытия окна печати<br />Вероятно, в браузере заблокированы всплывающие окна" : err.message
                });
              }
						}
					});

			}
			else{
        return _formula && _formula(obj)
      }

		}
	},

	_template: {
		get: function () {
			if(!this._data._template){
        this._data._template = new $p.SpreadsheetDocument(this.template);
      }
			return this._data._template;
		}
	}
});
