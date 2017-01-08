/**
 * Дополнительные методы справочника Номенклатура
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 * @module cat_nom
 * Created 23.12.2015
 */

// определяем модификаторы
$p.cat.nom.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		}
	},

	sql_selection_where_flds: {
		value: function(filter){
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
		value: function (attr) {

			if(!attr)
				attr = {};

			if(!attr.price_type)
				attr.price_type = $p.job_prm.pricing.price_type_sale;
			else if($p.utils.is_data_obj(attr.price_type))
				attr.price_type = attr.price_type.ref;

			if(!attr.characteristic)
				attr.characteristic = $p.utils.blank.guid;
			else if($p.utils.is_data_obj(attr.characteristic))
				attr.characteristic = attr.characteristic.ref;

			if(!attr.date)
				attr.date = new Date();

			var price = 0, currency, start_date = $p.utils.blank.date;

      // если для номенклатуры существует структура цен, ищем подходящую
			if(this._data._price){
				if(this._data._price[attr.characteristic]){
					if(this._data._price[attr.characteristic][attr.price_type]){
						this._data._price[attr.characteristic][attr.price_type].forEach(function (row) {
							if(row.date > start_date && row.date <= attr.date){
								price = row.price;
								currency = row.currency;
                start_date = row.date;
							}
						})
					}

				}else if(attr.clr){

        }

      }

      // если есть формула - выполняем вне зависимости от установленной цены
      if(attr.formula){

        // если нет цены на характеристику, ищем цену без характеристики
        if(!price){
          if(this._data._price[$p.utils.blank.guid][attr.price_type]){
            this._data._price[$p.utils.blank.guid][attr.price_type].forEach(function (row) {
              if(row.date > start_date && row.date <= attr.date){
                price = row.price;
                currency = row.currency;
                start_date = row.date;
              }
            })
          }
        }
        price = attr.formula.execute({
          nom: this,
          characteristic: $p.cat.characteristics.get(attr.characteristic, false),
          date: attr.date,
          price: price,
          currency: currency
        })
      }

			// Пересчитать из валюты в валюту
			return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

		}
	}
});
