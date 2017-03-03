/**
 * Контекстный отчет по ценам номенклатуры
 *
 * @module dp_builder_price
 *
 * Created by Evgeniy Malyarov on 12.02.2017.
 */

// переопределяем форму обработки в качестве отчета по ценам номенклатуры
$p.DpBuilder_price.prototype.__define({

  form_obj: {
    value: function (pwnd, attr) {

      const {nom, goods, _manager, _metadata} = this;

      // форма в модальном диалоге
      const options = {
        name: 'wnd_obj_' + _manager.class_name,
        wnd: {
          top: 80 + Math.random()*40,
          left: 120 + Math.random()*80,
          width: 780,
          height: 400,
          modal: true,
          center: false,
          pwnd: pwnd,
          allow_close: true,
          allow_minmax: true,
          caption: `Цены: <b>${nom.name}</b>`
        }
      };

      const wnd = $p.iface.dat_blank(null, options.wnd);

      const ts_captions = {
        "fields":["price_type","nom_characteristic","date","price","currency"],
        "headers":"Тип Цен,Характеристика,Дата,Цена,Валюта",
        "widths":"200,*,150,120,100",
        "min_widths":"150,200,100,100,100",
        "aligns":"",
        "sortings":"na,na,na,na,na",
        "types":"ro,ro,dhxCalendar,ro,ro"
      };

      return $p.wsql.pouch.local.doc.query('doc/doc_nom_prices_setup_slice_last', {
        limit : 1000,
        include_docs: false,
        startkey: [nom.ref, ''],
        endkey: [nom.ref, '\uffff']
      })
        .then((data) => {
        if(data && data.rows){
          data.rows.forEach((row) => {
            goods.add({
              nom_characteristic: row.key[1],
              price_type: row.key[2],
              date: row.value.date,
              price: row.value.price,
              currency: row.value.currency
            })
          });

          goods.sort(["price_type","nom_characteristic","date"]);

          wnd.elmnts.grids.goods = wnd.attachTabular({
            obj: this,
            ts: "goods",
            pwnd: wnd,
            ts_captions: ts_captions
          });
          wnd.detachToolbar();
        }
      })

    }
  }
});
