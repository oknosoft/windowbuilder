/**
 * Переопределяем поведение параметра _Площадь списка продукций_
 *
 * @module prod_list_area
 *
 * Created 22.07.2022.
 */

export default function ({properties, utils}) {
  const prod_list_area = properties.predefined('prod_list_area');
  if(prod_list_area) {

    import('../../components/PropFields/ProdListArea')
      .then((module) => {
        prod_list_area.Editor = module.default;
      });

    prod_list_area.extract_pvalue = function ({ox, cnstr, elm, origin, prow}) {
      let value = 0;
      if(!prow && ox) {
        const {product_params, params} = ox;
        const inset = (typeof origin !== 'number' && origin) || utils.blank.guid;
        if(params) {
          prow = params.find({param: this, region: 0, cnstr, inset});
        }
        else if(product_params) {
          prow = product_params.find({param: this, elm});
        }
      }
      if(prow) {
        try {
          const tmp = JSON.parse(prow.value);
          if(Array.isArray(tmp)) {
            const {calc_order} = prow._owner._owner;
            for(const [ref, v] of tmp) {
              if(ref) {
                const row = calc_order.production.find({characteristic: ref});
                if(row) {
                  value += row.quality * row.characteristic.s;
                }
              }
              else if(v) {
                value += v;
              }
            }
          }
        }
        catch (e) {}
      }
      return value;
    };

    prod_list_area.set_pvalue = function ({ox, cnstr, elm, origin, prow, value}) {
      if(!prow && ox) {
        const {product_params, params} = ox;
        const inset = (typeof origin !== 'number' && origin) || utils.blank.guid;
        if(params) {
          prow = params.find({param: this, region: 0, cnstr, inset});
        }
        else if(product_params) {
          prow = product_params.find({param: this, elm});
        }
        if(!prow && params) {
          prow = params.add({param: this, region: 0, cnstr, inset});
        }
      }
      if(prow) {
        prow.value = JSON.stringify(value);
      }
      return true;
    };

  }
}
