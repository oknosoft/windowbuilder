/**
 * ### Отчет _Потребность в материалах_
 *
 * @module materials_demand
 *
 * Created 07.11.2016
 */

(($p) => {

  const Proto = $p.RepMaterials_demand

  // переопределяем прототип
  $p.RepMaterials_demand = class RepMaterials_demand extends Proto {

    get print_data() {
      return this.calc_order.print_data.then((order) => {
          return this.calculate()
            .then((spec) => ({order, spec}))
        })
    }

    // извлекает спецификацию изделий заказа, фильтрует и группирует
    calculate(_columns) {

      const {specification, production, scheme, _manager} = this;
      const arefs = [];
      const aobjs = [];
      const spec_flds = Object.keys($p.cat.characteristics.metadata('specification').fields);
      const rspec_flds = Object.keys(_manager.metadata('specification').fields);

      function material(row) {

        let res = row.nom.presentation;

        if (!row.characteristic.empty()) {
          res += ' ' + row.characteristic.presentation;
        }

        if (row.len && row.width)
          res += ' ' + (1000 * row.len).toFixed(0) + "x" + (1000 * row.width).toFixed(0);
        else if (row.len)
          res += ' ' + (1000 * row.len).toFixed(0);
        else if (row.width)
          res += ' ' + (1000 * row.width).toFixed(0);

        return res;
      }

      // получаем массив объектов продукций
      production.each((row) => {
        if (!row.characteristic.empty() && row.characteristic.is_new() && arefs.indexOf(row.characteristic.ref) == -1) {
          arefs.push(row.characteristic.ref)
          aobjs.push(row.characteristic.load())
        }
      })

      // чистим таблицу результата
      specification.clear();
      if (!specification._rows) {
        specification._rows = []
      } else {
        specification._rows.length = 0;
      }

      return Promise.all(aobjs)

      // получаем массив объектов заказов и вложенных характеристик
        .then((ares) => {

          arefs.length = 0;
          aobjs.length = 0;

          production.each((row) => {

            if (!row.characteristic.empty() && !row.characteristic.calc_order.empty()
              && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
              arefs.push(row.characteristic.calc_order.ref)
              aobjs.push(row.characteristic.calc_order.load())
            }

            row.characteristic.specification.each(function (sprow) {
              if (!sprow.characteristic.empty() && sprow.characteristic.is_new() && arefs.indexOf(sprow.characteristic.ref) == -1) {
                arefs.push(sprow.characteristic.ref)
                aobjs.push(sprow.characteristic.load())
              }
            })

          });

          return Promise.all(aobjs)

        })

        .then(() => {

          const prows = {};

          // бежим по продукции и заполняем результат
          production.each(function (row) {
            if (!row.characteristic.empty()) {
              row.characteristic.specification.each((sprow) => {
                let resrow = {};
                spec_flds.forEach(fld => {
                  if (rspec_flds.indexOf(fld) != -1) {
                    resrow[fld] = sprow[fld]
                  }
                });
                resrow = specification.add(resrow)

                // учтём количество
                resrow.qty = resrow.qty * row.qty;
                resrow.totqty = resrow.totqty * row.qty;
                resrow.totqty1 = resrow.totqty1 * row.qty;
                resrow.amount = resrow.amount * row.qty;
                resrow.amount_marged = resrow.amount_marged * row.qty;

                // рассчитаем недостающие поля

                // если номер элемента < 0, интерпретируем его, как номер конструкции
                if (resrow.elm > 0) {
                  resrow.cnstr = row.characteristic.coordinates.find_rows({elm: resrow.elm})[0].cnstr;
                }
                else if (resrow.elm < 0) {
                  resrow.cnstr = -resrow.elm;
                }

                // ссылка на заказ
                resrow.calc_order = row.characteristic;

                // номер строки изделия в исходном заказе
                if (!prows[row.characteristic.ref]) {
                  prows[row.characteristic.ref] = row.characteristic.calc_order.production.find_rows({characteristic: row.characteristic});
                  if (prows[row.characteristic.ref].length) {
                    prows[row.characteristic.ref] = prows[row.characteristic.ref][0].row
                  }
                  else {
                    prows[row.characteristic.ref] = 1
                  }
                }
                resrow.product = prows[row.characteristic.ref];

                // свойства номенклатуры и группировки
                resrow.nom_kind = resrow.nom.nom_kind;
                resrow.material = material(resrow);
                //resrow.grouping = resrow.nom.grouping;

              })
            }
          })

          // сворачиваем результат и сохраняем его в specification._rows
          const dimentions = [], resources = [];
          if(!_columns){
            _columns = scheme.columns('ts')
          }
          _columns.forEach(fld => {
            const {key} = fld
            if ($p.RepMaterials_demand.resources.indexOf(key) != -1) {
              resources.push(key)
            } else {
              dimentions.push(key)
            }
          })
          specification.group_by(dimentions, resources);
          specification.forEach((row) => {

            // округление
            row.qty = row.qty.round(3);
            row.totqty = row.totqty.round(3);
            row.totqty1 = row.totqty1.round(3);
            row.price = row.price.round(3);
            row.amount = row.amount.round(3);
            row.amount_marged = row.amount_marged.round(3);

            specification._rows.push(row);
          })
          return specification._rows;
        })
    }

    form_obj(pwnd, attr) {

      this._data._modified = false;

      const {calc_order, _manager, _metadata} = this;

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
          caption: `<b>${calc_order.presentation}</b>`
        }
      };

      this.wnd = $p.iface.dat_blank(null, options.wnd);
      const {elmnts} = this.wnd;

      // тулбар + закладки
      this.draw_tabs(this.wnd);

      // табчасть продукции
      elmnts.grids.production = this.draw_production(elmnts.tabs.cells("prod"));

      // табчасть состава отчета
      elmnts.grids.composition = this.draw_composition(elmnts.tabs.cells("composition"));



      // следим за изменениями варианта настроек
      const observer = this.observer.bind(this);
      Object.observe(this, observer);
      this.wnd.attachEvent("onClose", () => {
        Object.unobserve(this, observer);
        elmnts.scheme.unload && elmnts.scheme.unload();
        for(let grid in elmnts.grids){
          elmnts.grids[grid].unload && elmnts.grids[grid].unload()
        }
        return true;
      });

      // установим вариант
      $p.cat.scheme_settings.get_scheme(_manager.class_name + '.specification')
        .then((scheme) => {
        this.scheme = scheme;
      });

      // заполняем табчасть изделий
      this.fill_by_order();

      return Promise.resolve({wnd: this.wnd, o: this});

    }

    // тулбар
    draw_tabs(wnd) {
      wnd.attachToolbar({
        items:[
          {id: "info", type: "text", text: "Вариант настроек:"},
          {id: "scheme", type: "text", text: "<div style='width: 300px; margin-top: -2px;' name='scheme'></div>"},
          {id: "data", type: "button", text: "<i class='fa fa-calculator fa-fw'></i>", title: 'Рассчитать'},
          //{id: "sep", type: "separator"},
          {id: "sp", type: "spacer"},
          {id: "print", type: "button", text: "<i class='fa fa-print fa-fw'></i>", title: 'Печать отчета'},
        ],
        onClick: (name) => {
          if(name == 'data'){
            this.print_data.then((data) => {
              console.log(data)
            })
          }
        }
      })

      // поле выбора варианта
      wnd.elmnts.scheme = new $p.iface.OCombo({
        parent: wnd.cell.querySelector('[name=scheme]'),
        obj: this,
        field: "scheme",
        width: 280
      });


      // закладки
      wnd.elmnts.tabs = wnd.attachTabbar({
        arrows_mode: "auto",
        tabs: [
          {id: "prod", text: "Продукция", active:  true},
          {id: "composition", text: "Состав"},
          {id: "columns", text: "Колонки"},
          {id: "selection", text: "Отбор"}
        ]
      });
    }

    draw_production(cell) {
      return cell.attachTabular({
        obj: this,
        ts: "production",
        ts_captions: {
          "fields":["characteristic","qty"],
          "headers":"Продукция,Штук",
          "widths":"*,150",
          "min_widths":"200,120",
          "aligns":"",
          "sortings":"na,na",
          "types":"ref,calck"
        }
      })
    }

    draw_columns(cell) {

      const grid = cell.attachTabular({
        obj: this.scheme,
        ts: "fields",
        disable_add_del: true,
        ts_captions: {
          "fields":["use","field","caption"],
          "headers":",Поле,Заголовок",
          "widths":"40,200,*",
          "min_widths":"40,200,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ro,ro"
        }
      });

      cell.detachToolbar();

      return grid;
    }

    draw_composition(cell) {

      if(!this.composition.count()){
        this.composition.load([
          {use: true, elm: "Шапка"},
          {use: true, elm: "Эскизы малые"},
          {use: false, elm: "Эскизы большие"},
          {use: false, elm: "Продукция"},
          {use: true, elm: "Спецификация"},
          {use: false, elm: "Пописи"},
          {use: false, elm: "Подвал"},
        ])
      }

      const grid = cell.attachTabular({
        obj: this,
        ts: "composition",
        disable_add_del: true,
        ts_captions: {
          "fields":["use","elm"],
          "headers":",Элемент",
          "widths":"40,*",
          "min_widths":"40,200",
          "aligns":"",
          "sortings":"na,na",
          "types":"ch,ro"
        }
      })

      cell.detachToolbar();

      return grid;

    }

    save_scheme() {

    }

    observer(changes) {
      changes.some((change) => {
        if(change.name == "scheme"){
          this.scheme_change();
          return true;
        }
      })
    }

    scheme_change() {
      // обновляем табчасть колонок
      const {grids, tabs} = this.wnd.elmnts;

      grids.columns && grids.columns.unload && grids.columns.unload();

      grids.columns = this.draw_columns(tabs.cells("columns"));
    }

    fill_by_order(row, _mgr) {

      let pdoc;

      if(!row || !row._id){
        if(this.calc_order.empty()){
          return;
        }
        if(this.calc_order.is_new()){
          pdoc = this.calc_order.load();
        }
        else{
          pdoc = Promise.resolve(this.calc_order);
        }
      }
      else{
        const ids = row._id.split('|');
        if (ids.length < 2) {
          return
        }
        pdoc = _mgr.get(ids[1], 'promise');
      }

      return pdoc
        .then((doc) => {
          //this.production.clear()
          const rows = []
          const refs = []
          doc.production.forEach((row) => {
            if (!row.characteristic.empty()) {
              rows.push({
                characteristic: row.characteristic,
                qty: row.qty,
              })
              if (row.characteristic.is_new()) {
                refs.push(row.characteristic.ref)
              }
            }
          })

          return ($p.adapters ? $p.adapters.pouch.load_array($p.cat.characteristics, refs) : $p.cat.characteristics.pouch_load_array(refs))
            .then(() => rows)
        })
        .then((rows) => {
          this.production.load(rows)
          return rows
        })
    }

    static get resources() {
      return ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged'];
    }

  }


})($p);





