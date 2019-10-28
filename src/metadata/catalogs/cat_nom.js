
exports.CatNomManager = class CatNomManager extends Object {

  load_array(aattr, forse) {
    // если внутри номенклатуры завёрнуты единицы - вытаскиваем
    const units = [];
    for(const row of aattr) {
      if(row.units) {
        row.units.split('\n').forEach((urow) => {
          const uattr = urow.split(',');
          units.push({
            ref: uattr[0],
            owner: row.ref,
            id: uattr[1],
            name: uattr[2],
            qualifier_unit: uattr[3],
            heft: parseFloat(uattr[4]),
            volume: parseFloat(uattr[5]),
            coefficient: parseFloat(uattr[6]),
            rounding_threshold: parseFloat(uattr[7]),
          });
        });
        delete row.units;
      }
    }
    const res = super.load_array(aattr, forse);
    const {currencies, nom_units} = this._owner;
    units.length && nom_units.load_array(units, forse);

    // если внутри номенклатуры завёрнуты цены - вытаскиваем
    for(const {_data, _obj} of res) {
      if(_obj._price) {
        _data._price = _obj._price;
        delete _obj._price;
        for(const ox in _data._price) {
          for(const type in _data._price[ox]) {
            const v = _data._price[ox][type];
            Array.isArray(v) && v.forEach((row) => {
              row.date = new Date(row.date);
              row.currency = currencies.get(row.currency);
            });
          }
        }
      }
    }

    return res;
  }

};

exports.CatNom = class CatNom extends Object {

  /**
   * Возвращает значение допреквизита группировка
   */
  get grouping() {
    if(!this.hasOwnProperty('_grouping')){
      const {extra_fields, _manager: {_owner}} = this;
      extra_fields.find_rows({property: _owner.$p.job_prm.properties.grouping}, (row) => {
        this._grouping = row.value.name;
      });
    }
    return this._grouping || '';
  }

  /**
   * Представление объекта
   * @return {string}
   */
  get presentation() {
    return this.name + (this.article ? ' ' + this.article : '');
  }
  set presentation(v) {

  }

  /**
   * Возвращает номенклатуру по ключу цветового аналога
   * @param clr
   * @return {any|CatNom}
   */
  by_clr_key(clr) {
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
    const {$p: {job_prm: {properties}, cat}} = this._manager._owner;
    const clr_key = properties.clr_key && properties.clr_key.ref;
    let clr_value;
    this.extra_fields.find_rows({property: properties.clr_key}, (row) => clr_value = row.value);
    if(!clr_value){
      return this;
    }

    // находим все номенклатуры с подходящим ключем цветового аналога
    this._manager.alatable.forEach((nom) => {
      nom.extra_fields && nom.extra_fields.some((row) => {
        row.property === clr_key && row.value === clr_value &&
        _clr_keys.set(cat.clrs.get(nom.clr), cat.nom.get(nom.ref));
      });
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

  /**
   * Возвращает цену номенклатуры указанного типа
   * - на дату
   * - с подбором характеристики по цвету
   * - с пересчетом из валюты в валюту
   *
   * @param attr
   * @return {Number|*}
   * @private
   */
  _price(attr) {
    const {job_prm, utils, cat, pricing} = this._manager._owner.$p;

    let price = 0,
      currency = job_prm.pricing.main_currency,
      start_date = utils.blank.date;

    if(!attr){
      attr = {currency};
    }
    const {_price} = this._data;
    const {x, y, z, clr, ref, calc_order} = (attr.characteristic || {});

    if(attr.price_type){

      if(utils.is_data_obj(attr.price_type)){
        attr.price_type = attr.price_type.ref;
      }

      if(!attr.characteristic){
        attr.characteristic = utils.blank.guid;
      }
      else if(utils.is_data_obj(attr.characteristic)){
        // если передали уникальную характеристику продкции - ищем простую с тем же цветом и размерами
        // TODO: здесь было бы полезно учесть соответствие цветов??
        attr.characteristic = ref;
        if(!calc_order.empty()){
          const tmp = [];
          const {by_ref} = cat.characteristics;
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
                });
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
            });
          }
        }
        // если нет цены на характеристику, ищем по цвету
        else if(attr.clr){
          const {by_ref} = cat.characteristics;
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
                });
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
      if(!price && _price && _price[utils.blank.guid]){
        if(_price[utils.blank.guid][attr.price_type]){
          _price[utils.blank.guid][attr.price_type].forEach((row) => {
            if(row.date > start_date && row.date <= attr.date){
              price = row.price;
              currency = row.currency;
              start_date = row.date;
            }
          });
        }
      }
      // формулу выполняем в любом случае - она может и не опираться на цены из регистра
      price = attr.formula.execute({
        nom: this,
        characteristic: cat.characteristics.get(attr.characteristic, false),
        date: attr.date,
        price, currency, x, y, z, clr, calc_order,
      });
    }

    // Пересчитать из валюты в валюту
    return pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);
  }
};
