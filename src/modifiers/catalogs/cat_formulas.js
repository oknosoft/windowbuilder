/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

// обработчик события после загрузки данных в озу
$p.adapters.pouch.once('pouch_data_loaded', () => {
  // читаем элементы из pouchdb и создаём формулы
  const {formulas} = $p.cat;
  formulas.adapter.find_rows(formulas, {_top: 500, _skip: 0})
    .then((rows) => {
      const parents = [formulas.predefined('printing_plates'), formulas.predefined('modifiers')];
      const filtered = rows.filter(v => !v.disabled && parents.indexOf(v.parent) !== -1);
      filtered.sort((a, b) => a.sorting_field - b.sorting_field).forEach((formula) => {
        // формируем списки печатных форм и внешних обработок
        if(formula.parent == parents[0]) {
          formula.params.find_rows({param: 'destination'}, (dest) => {
            const dmgr = $p.md.mgr_by_class_name(dest.value);
            if(dmgr) {
              if(!dmgr._printing_plates) {
                dmgr._printing_plates = {};
              }
              dmgr._printing_plates[`prn_${formula.ref}`] = formula;
            }
          });
        }
        else {
          // выполняем модификаторы
          try {
            formula.execute();
          }
          catch (err) {
          }
        }
      });
    });
});


$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj, attr) {

			// создаём функцию из текста формулы
			if(!this._data._formula && this.formula){
			  try{
          if(this.async){
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            this._data._formula = (new AsyncFunction("obj,$p,attr", this.formula)).bind(this);
          }
          else{
            this._data._formula = (new Function("obj,$p,attr", this.formula)).bind(this);
          }
        }
        catch(err){
          this._data._formula = () => false;
          $p.record_log(err);
        }
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

				// получаем HTMLDivElement с отчетом
				return _formula(obj, $p, attr)

				  // показываем отчет в отдельном окне
					.then((doc) => doc instanceof $p.SpreadsheetDocument && doc.print());

			}
			else{
        return _formula && _formula(obj, $p, attr)
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
