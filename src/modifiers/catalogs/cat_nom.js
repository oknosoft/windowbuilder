/**
 * Дополнительные методы справочника Номенклатура
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 * @module cat_nom
 * Created 23.12.2015
 */

// определяем модификаторы
$p.cat.nom.__define({

	sql_selection_list_flds: {
		value(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		}
	},

	sql_selection_where_flds: {
		value(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		}
	}
});

// методы ценообразования в прототип номенклатуры
$p.CatNom.prototype.__define({

	/**
	 * Возвращает цену номенклатуры указанного типа
	 * - на дату
	 * - с подбором характеристики по цвету
	 * - с пересчетом из валюты в валюту
	 */
	_price: {
		value(attr) {

      let price = 0,
        currency = $p.job_prm.pricing.main_currency,
        start_date = $p.utils.blank.date;

			if(!attr){
        attr = {currency};
      }

			if(attr.price_type){

        if($p.utils.is_data_obj(attr.price_type)){
          attr.price_type = attr.price_type.ref;
        }

        const {_price} = this._data;
        const {x, y, z, clr, ref, calc_order} = (attr.characteristic || {});

        if(!attr.characteristic){
          attr.characteristic = $p.utils.blank.guid;
        }
        else if($p.utils.is_data_obj(attr.characteristic)){
          // если передали уникальную характеристику продкции - ищем простую с тем же цветом и размерами
          // TODO: здесь было бы полезно учесть соответствие цветов??
          attr.characteristic = ref;
          if(!calc_order.empty()){
            const tmp = [];
            const {by_ref} = $p.cat.characteristics;
            for(let clrx in _price) {
              const cx = by_ref[clrx];
              if(cx && cx.clr == clr){
                // если на подходящую характеристику есть цена по нашему типу цен - запоминаем
                if(_price[clrx][attr.price_type]){
                  if(cx.x && x && cx.x - x < -10){
                    continue;
                  }
                  if(cx.y && y && cx.y - y < -10){
                    continue;
                  }
                  tmp.push({
                    cx,
                    rate: (cx.x && x ? Math.abs(cx.x - x) : 0) + (cx.y && y ? Math.abs(cx.y - y) : 0) + (cx.z && z && cx.z == z ? 1 : 0)
                  })
                }
              }
            }
            if(tmp.length){
              tmp.sort((a, b) => a.rate - b.rate);
              attr.characteristic = tmp[0].cx.ref;
            }
          }
        }
        if(!attr.date){
          attr.date = new Date();
        }

        // если для номенклатуры существует структура цен, ищем подходящую
        if(_price){
          if(_price[attr.characteristic]){
            if(_price[attr.characteristic][attr.price_type]){
              _price[attr.characteristic][attr.price_type].forEach((row) => {
                if(row.date > start_date && row.date <= attr.date){
                  price = row.price;
                  currency = row.currency;
                  start_date = row.date;
                }
              })
            }
          }
          // если нет цены на характеристику, ищем по цвету
          else if(attr.clr){
            const {by_ref} = $p.cat.characteristics;
            for(let clrx in _price){
              const cx = by_ref[clrx];
              if(cx && cx.clr == attr.clr){
                if(_price[clrx][attr.price_type]){
                  _price[clrx][attr.price_type].forEach((row) => {
                    if(row.date > start_date && row.date <= attr.date){
                      price = row.price;
                      currency = row.currency;
                      start_date = row.date;
                    }
                  })
                  break;
                }
              }
            }
          }
        }

      }


      // если есть формула - выполняем вне зависимости от установленной цены
      if(attr.formula){

        // если нет цены на характеристику, ищем цену без характеристики
        if(!price && _price && _price[$p.utils.blank.guid]){
          if(_price[$p.utils.blank.guid][attr.price_type]){
            _price[$p.utils.blank.guid][attr.price_type].forEach((row) => {
              if(row.date > start_date && row.date <= attr.date){
                price = row.price;
                currency = row.currency;
                start_date = row.date;
              }
            })
          }
        }
        // формулу выполняем в любом случае - она может и не опираться на цены из регистра
        price = attr.formula.execute({
          nom: this,
          characteristic: $p.cat.characteristics.get(attr.characteristic, false),
          date: attr.date,
          price, currency, x, y, z, clr, calc_order,
        })
      }

			// Пересчитать из валюты в валюту
			return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

		}
	},

  /**
   * Возвращает значение допреквизита группировка
   */
  grouping: {
	  get() {
      if(!this.hasOwnProperty('_grouping')){
        this.extra_fields.find_rows({property: $p.job_prm.properties.grouping}, (row) => {
          this._grouping = row.value.name;
        })
      }
      return this._grouping || '';
    }
  },

  /**
   * Представление объекта
   * @property presentation
   * @for CatObj
   * @type String
   */
  presentation: {
    get(){
      return this.name + (this.article ? ' ' + this.article : '');
    },
    set(v){
    }
  },

  /**
   * Возвращает номенклатуру по ключу цветового аналога
   */
  by_clr_key: {
    value(clr) {

      if(this.clr == clr){
        return this;
      }
      if(!this._clr_keys){
        this._clr_keys = new Map();
      }
      const {_clr_keys} = this;
      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(_clr_keys.size){
        return this;
      }

      // получаем ссылку на ключ цветового аналога
      const clr_key = $p.job_prm.properties.clr_key && $p.job_prm.properties.clr_key.ref;
      let clr_value;
      this.extra_fields.find_rows({property: $p.job_prm.properties.clr_key}, (row) => clr_value = row.value);
      if(!clr_value){
        return this;
      }

      // находим все номенклатуры с подходящим ключем цветового аналога
      this._manager.alatable.forEach((nom) => {
        nom.extra_fields && nom.extra_fields.some((row) => {
          row.property === clr_key && row.value === clr_value &&
            _clr_keys.set($p.cat.clrs.get(nom.clr), $p.cat.nom.get(nom.ref));
        })
      });

      // возарвщаем подходящую или себя
      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(!_clr_keys.size){
        _clr_keys.set(0, 0);
      }
      return this;
    }
  }

});
