import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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
  return $p.adapters.pouch.fetch(`/adm/api/foroom`)
    .then((res) => res.json())
    .then((data) => {
      Object.assign(catalogs, {data, stamp: Date.now()});
      return data;
    });
};

const load_script = () => {
  return $p.adapters.pouch.fetch(`/adm/api/foroom/js`)
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
    });
};

class Additions extends React.Component {

  state = {product: null, props: {}, price: 0};

  // при необходимости, создаёт и дозаполняет заказ поставщику
  setOrder() {
    const {cat, doc, current_user: responsible} = $p;
    const {ref, cmd} = this.props.dialog;
    let res = Promise.resolve();

    this.supplier = cat.http_apis.by_name('FOROOM');
    if(this.supplier.empty() || this.supplier.is_new()) {
      throw 'empty supplier';
    }
    this.calc_order = doc.calc_order.get(ref);
    const {organization, department, orders} = this.calc_order;
    this.calc_order_row = cmd;
    this.invoice_row = orders.find({is_supplier: this.supplier});
    if(!this.invoice_row) {
      this.invoice_row = orders.add({is_supplier: this.supplier});
    }
    if(this.invoice_row.invoice.empty()) {
      res = res.then(() => doc.purchase_order.create({responsible, organization, department}))
        .then((invoice) => {
          this.invoice_row.invoice = invoice;
        });
    }
    else if(this.invoice_row.invoice.is_new()) {
      res = res.then(() => this.invoice_row.invoice.load());
    }

    return res
      .then(() => {
        const {goods} = this.invoice_row.invoice;
        this.goods_row = goods.find({nom_characteristic: this.calc_order_row.characteristic});
        if(!this.goods_row) {
          this.goods_row = goods.add({
            calc_order: this.calc_order,
            nom: this.calc_order_row.nom,
            nom_characteristic: this.calc_order_row.characteristic,
            unit: this.calc_order_row.nom.storage_unit,
            quantity: this.calc_order_row.quantity,
          });
        }
        this.calc_order_row.characteristic.origin = this.invoice_row.invoice;

        // восстанавливаем параметры
        const {identifier, params} = this.goods_row;
        if(identifier && params) {
          const ids = identifier.split('|');
          const product = foroomApi.params.init_data.all_data.izd.find(
            ({tid, ptype, category}) => tid == ids[0] && ptype == ids[1] && category == ids[2]);
          if(product) {
            try {
              const props = {};
              const prms = JSON.parse(params);
              for(const prop of product.params) {
                if(foroomApi.filter_params(prop)) {
                  if(prms.hasOwnProperty(prop.alias)) {
                    props[prop.alias] = prms[prop.alias];
                  }
                  else if(prop.alias === 'amount') {
                    props.amount = this.calc_order_row.quantity;
                  }
                  else if(prop.typ.startsWith('radio')) {
                    props[prop.alias] = prop.options[0] ? prop.options[0].val : prop.val;
                  }
                  else {
                    props[prop.alias] = prop.val;
                  }
                }
              }
              if(prms.material) {
                props.material = prms.material;
              }
              else if(product.materials.length) {
                props.material = product.materials[0].tid;
              }
              return this.setState({product, props, price: this.calc_order_row.price});
            }
            catch (e) {}
          }
        }
        this.forceUpdate();
      });
  }

  componentDidMount() {

    Promise.resolve()
      .then(() => {
        return foroomApi || load_script()
          .then(() => this.forceUpdate());
      })
      .then(() => {
        return calc || load_data()
          .then((init_data) => {
            const params = {
              debug: true,
              account: {
                price_margin: 1,  // наценка на прайс-лист
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
          });
      })
      .then(() => {
        this.setOrder();
      })
      .catch((err) => null); /* eslint-disable-line */
  }

  handleCalck() {
    const {product, props} = this.state;
    const tmpl = Object.assign({}, props, {
      type: product.ptype,
      subtype: product.category,
    });

    calc.load_template(tmpl);  // загружаем изделие
    calc.current_item.calcPrice(); // расчитываем его
    if (calc.current_item.error) {
      const {params} = product;
      $p.ui.dialogs.alert({
        title: 'Ошибка расчета жалюзи',
        text: calc.current_item.errors.map((p) => {
          const prm = params.find((v) => v.alias === p);
          return prm ? prm.name : p;
        }).join(', ')});
    }
    else {
      const {goods_row, calc_order_row} = this;
      const {characteristic: cx} = calc_order_row;

      // тут будет изделие, которое можно запустить в работу, если ошибок нет
      //data.items.push(calc.current_item.release());
      // тут будут расписаны все параметры (очень удобно формировать из этого приложения к договору)
      //data.items_rus.push(calc.convert_item_to_preview(tmpl));

      goods_row.price = calc.current_item.price;
      goods_row.quantity = tmpl.amount || 1;
      goods_row.params = JSON.stringify($p.utils._mixin({}, tmpl, [], ['amount','type','subtype']));
      goods_row.identifier = `${product.tid}|${product.ptype}|${product.category}`;

      const {material, name} = calc.convert_item_to_preview(tmpl);
      cx.x = tmpl.width;
      cx.y = tmpl.height;
      cx.s = cx.x * cx.y / 1e6;
      cx.note = `${name.val}/${material.val}`;
      cx.name = cx.prod_name();

      Object.assign(calc_order_row._obj, {
        len: cx.x,
        width: cx.y,
        s: cx.s,
        first_cost: calc.current_item.price,
      });
      calc_order_row.value_change('quantity', '', goods_row.quantity);

      const {wnd} = this.props.dialog;
      this.calc_order._modified = true;
      wnd.set_text(this.calc_order.presentation);

      const {production} = wnd.elmnts.grids;
      production.refresh_row(calc_order_row);
      this.setState({price: calc_order_row.price});
    }

    return this.invoice_row.invoice.save();
  }

  setProduct = (product) => {
    const props = {};
    for(const prop of product.params) {
      if(foroomApi.filter_params(prop)) {
        if(prop.typ.startsWith('radio')) {
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
    this.setState({product, props, price: 0});
  };

  setProp = (name) => {
    return (value) => {
      const {props} = this.state;
      if(value && value.target instanceof HTMLElement) {
        value = value.target.value;
      }
      const nprops = Object.assign({}, props, {[name]: value});
      this.setState({props: nprops, price: 0});
    };
  };

  render() {
    if(!foroomApi) {
      return <LoadingMessage text="Загрузка библиотеки..."/>;
    }
    if(!catalogs.data) {
      return <LoadingMessage text="Подготовка данных..."/>;
    }
    if(!this.goods_row) {
      return <LoadingMessage text="Чтение заказа..."/>;
    }
    const {product, props, price} = this.state;
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
          <div>
            <Typography component="span" variant="h4">Цена: </Typography>
            <Typography component="span" variant={price ? 'h4' : 'h6'} color="secondary">{price || 'Не рассчитана'}</Typography>
            {price ? <Typography component="span" variant="h4"> ₽</Typography> : null}
          </div>
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
