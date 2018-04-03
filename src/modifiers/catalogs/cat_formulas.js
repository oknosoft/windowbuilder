/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

$p.CatFormulas.prototype.__define({

	execute: {
		value(obj, attr) {

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
		get() {
			if(!this._data._template){
        this._data._template = new $p.SpreadsheetDocument(this.template);
      }
			return this._data._template;
		}
	}
});
