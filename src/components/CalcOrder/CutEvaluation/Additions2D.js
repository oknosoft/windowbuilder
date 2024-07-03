import React from 'react';
import Additions2DTabs from './Additions2DTabs';
import Additions2DCutsIn from './Additions2DCutsIn';
import Additions2DCutsOut from './Additions2DCutsOut';
import Additions2DCutting from './Additions2DCutting';
import Additions2DReport from './Additions2DReport';

class Additions2D extends React.Component {

  state = {tab: 'cuts_in'};

  componentDidMount() {
    $p.doc.work_centers_task.create().then((doc) => {
      doc.fill_by_orders([this.props.dialog.ref])
        .then(() => doc.fill_cutting({linear: false, c2d: true}))
        .then(() => {
          this.doc = doc.fill_cuts();
          this.forceUpdate();
        });
    });
  }

  componentWillUnmount() {
    this.doc && this.doc.unload();
  }

  // закидываем обрезки в заказ или продукции заказа
  handleCalck(attr) {
    const {props: {dialog}, doc} = this;
    const {doc: {calc_order: mgr}, CatClrs} = $p;
    const calc_order = mgr.get(dialog.ref);

    // attr.pre - удалить обрезь
    // attr.calck - добавить в изделия
    // !attr.calck - добавить в заказ

    // чистим возможные прежние распределения
    calc_order.reset_specify('2D');
    if(attr?.pre) {
      calc_order.production.sync_grid(dialog.wnd.elmnts.grids.production);
      return Promise.resolve({close: true});
    }

    const {production} = dialog.wnd ? dialog.wnd.elmnts.grids : {};
    // группируем данные во временном документе
    const tmp = doc._manager.create({}, false, true);
    doc.cuts.find_rows({record_kind: 'Приход', _top: 1e6}, ({nom, characteristic, len, width}) => {
      tmp.cuts.add({nom, characteristic, len: len * width / 1e6});
    });
    for(const {nom, characteristic, len, width} of doc.cutting) {
      tmp.cutting.add({nom, characteristic, len: len * width / 1e6});
    }
    tmp.cuts.group_by(['nom', 'characteristic'], ['len']);
    tmp.cutting.group_by(['nom', 'characteristic'], ['len']);

    // сводная спецификация заказа поставщику
    const full = calc_order.aggregate_specification();
    const aggregates = new Map();

    for(const {nom, characteristic, len, width} of tmp.cuts) {
      const crow = tmp.cutting.find({nom, characteristic});
      if(crow && len > crow.len) {
        if(attr?.calck) {
          // строка потребности всего заказа
          const frow = characteristic instanceof CatClrs ?
            full.specification.find({nom, clr: characteristic}) :
            full.specification.find({nom, nom_characteristic: characteristic});
          if(frow) {
            for(const orow of calc_order.production) {
              if(orow.characteristic.calc_order === calc_order) {
                // строка потребности текущего изделия
                if(!aggregates.has(orow)) {
                  aggregates.set(orow, calc_order.aggregate_specification(orow));
                }
                const curr = aggregates.get(orow);
                // строка потребности текущей продукции
                const ccrow = characteristic instanceof CatClrs ?
                  curr.specification.find({nom, clr: characteristic}) :
                  curr.specification.find({nom, nom_characteristic: characteristic});
                if(ccrow) {
                  // общая дельта
                  const adelta = len - frow.quantity;
                  // взвешенная дельта в единицах хранения
                  const ddelta = (adelta * ccrow.quantity / frow.quantity) / (orow.quantity || 1);

                  // вклад в рублях deposit += ddelta * prow.price;
                  if(ddelta) {
                    const erow = characteristic instanceof CatClrs ?
                      orow.characteristic.specification.find({nom, clr: characteristic}) :
                      orow.characteristic.specification.find({nom, characteristic});
                    if(erow && erow.s && !nom.cutting_optimization_type.is('no') ) {
                      const {nom, characteristic, clr, price, amount_marged, totqty1} = erow;
                      const drow = orow.characteristic.specification.add({
                        nom,
                        characteristic,
                        clr,
                        dop: -3,
                        qty: 1,
                        s: ddelta,
                        totqty: ddelta,
                        totqty1: ddelta,
                        price,
                        amount: price * ddelta,
                        amount_marged: (amount_marged / totqty1) * ddelta,
                      });
                    }
                  }
                }
              }
            }
          }
        }
        else {
          const orow = calc_order.production.add({nom, characteristic, qty: 1, changed: 3});
          orow.quantity = orow.s = ((len - crow.len)).round(3);
          production?.refresh_row(orow);
        }
      }
    }
    if(attr?.calck) {
      calc_order._slave_recalc = true;
      for(const orow of calc_order.production) {
        orow.value_change('quantity', 'update', orow.quantity);
        production.refresh_row(orow);
      }
      calc_order._slave_recalc = false;
    }
    tmp.unload();
    calc_order.production.sync_grid(dialog.wnd.elmnts.grids.production);
    return Promise.resolve({close: true});
  }

  setTab = (tab) => {
    this.setState({tab});
  };

  render() {
    const {state: {tab}, setTab, doc, div} = this;
    return <>
      <Additions2DTabs tab={tab} setTab={setTab}/>
      <div style={{position: 'relative', width: '100%', height: 'calc(100% - 58px)'}} ref={(el => this.div = el)}>
        {tab === 'cuts_in' && doc && <Additions2DCutsIn obj={doc} div={div} />}
        {tab === 'cuts_out' && doc && <Additions2DCutsOut obj={doc} div={div}/>}
        {tab === 'cutting' && doc && <Additions2DCutting obj={doc} div={div}/>}
        {tab === 'report' && doc && <Additions2DReport obj={doc} div={div}/>}
      </div>
    </>;
  }
}

export default Additions2D;
