/**
 * ### Отчет _Потребность в материалах_
 *
 * @module materials_demand
 *
 * Created 07.11.2016
 */

(($p) => {

  // дополняем прототип отчета
  Object.assign($p.RepMaterials_demand.prototype, {

    // формирует данные печати, склеивая их из данных заказа и текущего отчета
    print_data() {
      // получаем структуру данных заказа
      return this.calc_order.print_data().then((order) => {
        // получаем данные спецификации
        return this.calculate012()
          .then((specification) => {
            // дополняем описанием продукции

            // возвращаем объединенную структуру
            return Object.assign(order, {specification, _grouping: this.scheme.dimensions})
          })
      })
    },

    // извлекает спецификацию изделий заказа, фильтрует и группирует
    calculate012() {

      const {specification, production, scheme, discard, _manager} = this;
      const arefs = [];
      const aobjs = [];
      const spec_flds = Object.keys($p.cat.characteristics.metadata('specification').fields);
      const rspec_flds = Object.keys(_manager.metadata('specification').fields);

      // получаем массив объектов продукций
      production.each((row) => {
        if(!row.use){
          return;
        }
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
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty() && !row.characteristic.calc_order.empty()
              && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
              arefs.push(row.characteristic.calc_order.ref)
              aobjs.push(row.characteristic.calc_order.load())
            }
            row.characteristic.specification.each((sprow) => {
              if (!sprow.characteristic.empty() && sprow.characteristic.is_new() && arefs.indexOf(sprow.characteristic.ref) == -1) {
                arefs.push(sprow.characteristic.ref)
                aobjs.push(sprow.characteristic.load())
              }
            })
          });

          return Promise.all(aobjs)

        })

        .then(() => {

          // строки изделия в исходном заказе
          const prows = {};

          // подготовим массив строк отбора
          const selection = [];
          scheme.selection.forEach((row) => {
            if(row.use){
              selection.push(row)
            }
          })

          // бежим по продукции и заполняем результат
          production.each((row) => {
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty()) {
              row.characteristic.specification.each((sprow) => {

                // фильтруем
                if(discard(sprow, selection)){
                  return;
                }

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
                this.material(resrow);

              })
            }
          })

          // сворачиваем результат и сохраняем его в specification._rows
          const dimentions = [], resources = [];
          scheme.columns('ts').forEach(fld => {
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
    },

    // формирует табличный докуменнт
    generate() {

      // получаем данные отчета
      return this.print_data().then((data) => {

        // создаём объект табличного документа
        const doc = new $p.SpreadsheetDocument(void(0), {fill_template: this.on_fill_template.bind(this)});

        // бежим по составу компоновки
        this.scheme.composition.find_rows({use: true}, (row) => {
          // выводим фрагмент
          doc.append(this.templates(row.field), data);
        });

        return doc;
      })
    },

    // фильтрует строку спецификации
    discard(row, selection) {
      return selection.some((srow) => {

        const left = srow.left_value.split('.');
        let left_value = row[left[0]];
        for(let i = 1; i < left.length; i++){
          left_value = left_value[left[i]];
        }

        const {comparison_type, right_value} = srow;
        const {comparison_types} = $p.enm;

        switch (comparison_type) {
        case comparison_types.eq:
          return left_value != right_value;

        case comparison_types.ne:
          return left_value == right_value;

        case comparison_types.lt:
          return !(left_value < right_value);

        case comparison_types.gt:
          return !(left_value > right_value);

        case comparison_types.in:
          return !left_value || right_value.indexOf(left_value.toString()) == -1;

        case comparison_types.nin:
          return right_value.indexOf(left_value.toString()) != -1;
        }

      })
    },

    // подмешивает в наименование материала характеристику и размеры
    material(row) {

      const {nom, characteristic, len, width} = row;

      let res = nom.name;

      if (!characteristic.empty()) {
        res += ' ' + characteristic.presentation;
      }

      if (len && width)
        row.sz = (1000 * len).toFixed(0) + "x" + (1000 * width).toFixed(0);
      else if (len)
        row.sz = + (1000 * len).toFixed(0);
      else if (width)
        row.sz = + (1000 * width).toFixed(0);

      row.nom_kind = nom.nom_kind;
      row.grouping = nom.grouping;
      row.article = nom.article;
      row.material = res;

      return res;
    },

    // деструктор
    form_obj(pwnd, attr) {

      this._data._modified = false;

      const {calc_order, _manager} = this;

      // окно + тулбар + закладки
      this.wnd = this.draw_tabs($p.iface.dat_blank(null, {
        width: 720,
        height: 400,
        modal: true,
        center: true,
        pwnd: pwnd,
        allow_close: true,
        allow_minmax: true,
        caption: `<b>${calc_order.presentation}</b>`
      }));
      const {elmnts} = this.wnd;

      // табчасть продукции
      elmnts.grids.production = this.draw_production(elmnts.tabs.cells("prod"));


      // следим за изменениями варианта настроек
      this.listener = this.listener.bind(this);
      this._manager.on('update', this.listener);

      this.wnd.attachEvent("onClose", () => {
        this._manager.off('update', this.listener);
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

    },

    // рисует тулбар и закладки
    draw_tabs(wnd) {

      const items = [
        {id: "info", type: "text", text: "Вариант настроек:"},
        {id: "scheme", type: "text", text: "<div style='width: 300px; margin-top: -2px;' name='scheme'></div>"}
      ];
      if($p.current_user.role_available("ИзменениеТехнологическойНСИ")){
        items.push(
          {id: "save", type: "button", text: "<i class='fa fa-floppy-o fa-fw'></i>", title: 'Сохранить вариант'},
          {id: "sep", type: "separator"},
          {id: "saveas", type: "button", text: "<i class='fa fa-plus-square fa-fw'></i>", title: 'Сохранить как...'});
      }
      items.push(
        {id: "sp", type: "spacer"},
        {id: "print", type: "button", text: "<i class='fa fa-print fa-fw'></i>", title: 'Печать отчета'});

      wnd.attachToolbar({
        items: items,
        onClick: (name) => {
          if(this.scheme.empty()){
            return $p.msg.show_msg({
              type: "alert-warning",
              text: "Не выбран вариант настроек",
              title: $p.msg.main_title
            });
          }
          if(name == 'print'){
            this.generate().then((doc) => doc.print());
          }
          else if(name == 'save'){
            this.scheme.save().then((scheme) => scheme.set_default());
          }
          else if(name == 'saveas'){
            $p.iface.query_value(this.scheme.name.replace(/[0-9]/g, '') + Math.floor(10 + Math.random() * 21), 'Укажите название варианта')
              .then((name) => {
                const proto = this.scheme._obj._clone();
                delete proto.ref;
                proto.name = name;
                return this.scheme._manager.create(proto);
              })
              .then((scheme) => scheme.save())
              .then((scheme) => this.scheme = scheme.set_default())
              .catch((err) => null);
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
          {id: "selection", text: "Отбор"},
          {id: "dimensions", text: "Группировка"},
        ]
      });

      return wnd;
    },

    draw_production(cell) {
      return cell.attachTabular({
        obj: this,
        ts: "production",
        ts_captions: {
          "fields":["use","characteristic","qty"],
          "headers":",Продукция,Штук",
          "widths":"40,*,150",
          "min_widths":"40,200,120",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ref,calck"
        }
      })
    },

    draw_columns(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "fields",
        reorder: true,
        //disable_add_del: true,
        ts_captions: {
          "fields":["use","field","caption"],
          "headers":",Поле,Заголовок",
          "widths":"40,200,*",
          "min_widths":"40,200,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    draw_composition(cell) {
      this.composition_parts();
      return cell.attachTabular({
        obj: this.scheme,
        ts: "composition",
        //disable_add_del: true,
        reorder: true,
        ts_captions: {
          "fields":["use","field","definition"],
          "headers":",Элемент,Описание",
          "widths":"40,160,*",
          "min_widths":"40,120,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    draw_selection(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "selection",
        reorder: true,
        ts_captions: {
          "fields":["use","left_value","comparison_type","right_value"],
          "headers":",Левое значение,Вид сравнения,Правое значение",
          "widths":"40,200,100,*",
          "min_widths":"40,200,100,200",
          "aligns":"",
          "sortings":"na,na,na,na",
          "types":"ch,ed,ref,ed"
        }
      });
    },

    draw_dimensions(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "dimensions",
        reorder: true,
        ts_captions: {
          "fields":["use","parent","field"],
          "headers":",Таблица,Поле",
          "widths":"40,200,*",
          "min_widths":"40,200,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    // перезаполняет табчасть состава по данным макета
    composition_parts(refill) {
      const {composition} = this.scheme;
      if(!composition.count()){
        refill = true;
      }
      if(refill){
        this.templates().forEach((template, index) => {
          const {attributes} = template;
          composition.add({
            field: attributes.id ? attributes.id.value : index,
            kind: attributes.kind ? attributes.kind.value : 'obj',
            definition: attributes.definition ? attributes.definition.value : 'Описание отсутствует',
          })
        });
      }
    },

    // возвращает массив шаблонов или конкретный шаблон
    templates(name) {

      const {children} = this.formula._template.content;

      if(name){
        return children.namedItem(name);
      }
      const res = [];
      for(let i = 0; i < children.length; i++){
        res.push(children.item(i))
      }
      return res;
    },

    // корректирует данные перед заполнением шаблона
    on_fill_template(template, data) {

      // при выводе спецификации
      if(template.attributes.tabular && template.attributes.tabular.value == "specification"){
        const specification = data.specification.map((row) => {
          return {
            product: row.product,
            grouping: row.grouping,
            Номенклатура: row.nom.article + ' ' + row.nom.name + (!row.clr.empty() && !row.clr.predefined_name ? ' ' + row.clr.name : ''),
            Размеры: row.sz,
            Количество: row.qty.toFixed(),
            Угол1: row.alp1,
            Угол2: row.alp2,
          }
        });
        return {specification, _grouping: data._grouping}
      }
      // при выводе продукции
      else if(template.attributes.tabular && template.attributes.tabular.value == "production"){
        const production = [];
        this.production.find_rows({use: true}, (row) => {
          production.push(Object.assign(
            this.calc_order.row_description(row),
            data.ПродукцияЭскизы[row.characteristic.ref] ?
              {svg: $p.iface.scale_svg(data.ПродукцияЭскизы[row.characteristic.ref], 170, 0)} : {}
          ))
        });
        return Object.assign({}, data, {production});
      }
      return data;
    },

    // слушатель изменений реквизитов обработки
    listener(obj, fields) {
      if(obj === this && fields.hasOwnProperty('scheme') && this.wnd && this.wnd.elmnts){
        // обновляем табчасти колонок и отбора
        const {grids, tabs} = this.wnd.elmnts;

        grids.columns && grids.columns.unload && grids.columns.unload();
        grids.selection && grids.selection.unload && grids.selection.unload();
        grids.composition && grids.composition.unload && grids.composition.unload();
        grids.dimensions && grids.dimensions.unload && grids.dimensions.unload();

        grids.columns = this.draw_columns(tabs.cells("columns"));
        grids.selection = this.draw_selection(tabs.cells("selection"));
        grids.composition = this.draw_composition(tabs.cells("composition"));
        grids.dimensions = this.draw_dimensions(tabs.cells("dimensions"));
      }
    },

    /**
     * Дополняет табчасть продукциями выбранного заказа
     * @param row
     * @param _mgr
     * @return {Promise.<TResult>}
     */
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
                use: true,
                characteristic: row.characteristic,
                qty: row.quantity,
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
    },

  });

  // реализуем статические свойства и методы
  Object.assign($p.RepMaterials_demand, {

    // список ресурсов по умолчанию
    resources: ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged'],
  });

})($p);





