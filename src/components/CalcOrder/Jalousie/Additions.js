import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import LoadingMessage from 'metadata-react/DumbLoader/LoadingMessage';
import SelectProduct from './SelectProduct';
import SelectMaterial from './SelectMaterial';
import Props from './Props';

let foroomApi;
let calc;

const catalogs = {
  stamp: Date.now(),
  data: null,
};

const load_data = () => {
  if(catalogs.data && Date.now() - catalogs.stamp < 36e5) {
    return Promise.resolve(catalogs.data);
  }
  return $p.adapters.pouch.fetch(`/adm/api/foroom`, {headers: new Headers()})
    .then((res) => res.json())
    .then((data) => {
      Object.assign(catalogs, {data, stamp: Date.now()});
      return data;
    });
};

class Additions extends React.Component {

  state = {product: null, props: {}};

  componentDidMount() {
    const start = foroomApi ?
      Promise.resolve() :
      $p.adapters.pouch.fetch(`/adm/api/foroom/js`, {headers: new Headers()})
        .then((res) => res.text())
        .then((code) => {
          //create a dom element to hold the code
          const script = document.createElement('script');
          script.type = 'text/javascript';
          //set the script tag text, including the debugger id at the end!!
          script.text = code + `\n////# sourceURL=/adm/api/foroom/js\n`;
          //append the code to the dom
          document.getElementsByTagName('head')[0].appendChild(script);
          foroomApi = window.foroomApi.default;
          foroomApi.filter_params = function (v) {
            return v.visible && v.enabled && !v.deleted && !['gab_width', 'gab_height'].includes(v.alias);
          };
          this.forceUpdate();
        });
    start
      .then(() => {
        return calc || load_data()
          .then((init_data) => {
            const params = {
              debug: true,
              account: {
                price_margin: 2,  // наценка на прайс-лист
                discounts: [],    // дискаунты аккаунта (оставляйте пустым, если не хотите чтобы ядро посчитало цены с неправильными скидками)
              },
              init_data,          // вот тут можно отдать справочники ядру
              console_mode: true, // дополняет неосновные параметры шаблона значениями по умолчанию, если они отсутсвуют. считаем его deprecated
              nodejs_mode: false, // это чтобы в логи лишнее не выводил, при работе через NodeJS
              destination: 'sfr', // sfr - позволяет работать со всеми изделиями и материалами, доступными в нашей системе sale.foroom
            };
            foroomApi.init(params);
            foroomApi.init_calc((engine) => {
              calc = engine;
              this.forceUpdate();
            });
          })
      })
      .catch((err) => {
        err = null;
      });
  }

  handleCalck() {
    const {product, props} = this.state;
    const tmpl = Object.assign({}, props, {
      type: product.ptype,
      subtype: product.category,
    });
    let data= {
      items: [],
      items_rus: [],
      errors: []
    };

    calc.load_template(tmpl);  // загружаем изделие
    calc.current_item.calcPrice(); // расчитываем его
    if (calc.current_item.error) {
      data.errors.push(calc.current_item.errors);  // тут будут ошибки, если они есть
    }
    else {
      // тут будет изделие, которое можно запустить в работу, если ошибок нет
      data.items.push(calc.current_item.release());
      // тут будут расписаны все параметры (очень удобно формировать из этого приложения к договору)
      data.items_rus.push(calc.convert_item_to_preview(tmpl));
    }

    return Promise.resolve();
  }

  setProduct = (product) => {
    const props = {};
    for(const prop of product.params) {
      if(foroomApi.filter_params(prop)) {
        if(prop.typ === 'radio') {
          props[prop.alias] = prop.options[0] ? prop.options[0].val : prop.val;
        }
        else {
          props[prop.alias] = prop.val;
        }
      }
    }
    if(product.materials.length) {
      props.material = product.materials[0].tid;
    }
    this.setState({product, props});
  };

  setProp = (name) => {
    return (value) => {
      const {props} = this.state;
      if(value && value.target instanceof HTMLElement) {
        value = value.target.value;
      }
      const nprops = Object.assign({}, props, {[name]: value});
      this.setState({props: nprops});
    };
  };

  render() {
    if(!foroomApi) {
      return <LoadingMessage text="Загрузка библиотеки..."/>;
    }
    if(!catalogs.data) {
      return <LoadingMessage text="Подготовка данных..."/>;
    }
    const {product, props} = this.state;
    return <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
      spacing ={3}
    >
        <Grid item xs={12} md={4}>
          <SelectProduct foroomApi={foroomApi} product={product} setProduct={this.setProduct} />
          {product && <SelectMaterial foroomApi={foroomApi} product={product} value={props.material}  setProp={this.setProp('material')}/>}
        </Grid>
        <Grid item xs={12} md={8}>
          <Props foroomApi={foroomApi} product={product} props={props} setProp={this.setProp}/>
        </Grid>
      </Grid>;
  }
}

Additions.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Additions;
