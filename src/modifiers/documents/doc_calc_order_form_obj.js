/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order_form_obj
 */

(function ($p) {

  const _mgr = $p.doc.calc_order;
  let _meta_patched;

  _mgr.form_obj = function (pwnd, attr, handlers) {

    let o, wnd;

    /**
     * структура заголовков табчасти продукции
     * @param source
     */
    if(!_meta_patched) {
      (function (source, user) {
        // TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
        if($p.wsql.get_user_param('hide_price_dealer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0';
        }
        else if($p.wsql.get_user_param('hide_price_manufacturer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма';
          source.widths = '40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70';
        }
        else {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70';
        }

        if(user.role_available('СогласованиеРасчетовЗаказов') || user.role_available('РедактированиеЦен') || user.role_available('РедактированиеСкидок')) {
          source.types = 'cntr,ref,ref,txt,ro,ro,ro,ro,calck,ref,calck,calck,ro,calck,calck,ro';
        }
        else {
          source.types = 'cntr,ref,ref,txt,ro,ro,ro,ro,calck,ref,ro,calck,ro,calck,calck,ro';
        }

        _meta_patched = true;

      })($p.doc.calc_order.metadata().form.obj.tabular_sections.production, $p.current_user);
    }

    attr.draw_tabular_sections = (o, wnd, tabular_init) => {

      /**
       * получим задействованные в заказе объекты характеристик
       */
      const refs = [];
      o.production.forEach((row) => {
        if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new()) {
          refs.push(row._obj.characteristic);
        }
      });
      const {cat: {characteristics}, enm: {obj_delivery_states}} = $p;
      characteristics.adapter.load_array(characteristics, refs, false,
          o.obj_delivery_state == obj_delivery_states.Шаблон && characteristics.adapter.local.templates)
        .then(() => {

          const footer = {
            columns: ",,,,#stat_total,,,#stat_s,,,,,#stat_total,,,#stat_total",
            _in_header_stat_s: function(tag,index,data){
              const calck=function(){
                let sum=0;
                o.production.forEach((row) => {
                  sum += row.s * row.quantity;
                });
                return sum.toFixed(2);
              }
              this._stat_in_header(tag,calck,index,data);
            }
          }

          // табчасть продукции со специфическим набором кнопок
          tabular_init('production', $p.injected_data['toolbar_calc_order_production.xml'], footer);
          const {production} = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent('onRowSelect', production_select);
          production.attachEvent('onEditCell', (stage,rId,cInd,nValue,oValue,fake) => {
            if(stage == 2 && fake !== true){
              if(production._edit_timer){
                clearTimeout(production._edit_timer);
              }
              production._edit_timer = setTimeout(() => {
                if(wnd && wnd.elmnts){
                  production.callEvent('onEditCell', [2, 0, 7, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 12, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 15, null, null, true]);
                }
              }, 300);
            }
          });

          let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
          toolbar.addSpacer('btn_delete');
          toolbar.attachEvent('onclick', toolbar_click);

          // табчасть планирования
          tabular_init('planning');
          toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
          toolbar.addButton('btn_fill_plan', 3, 'Заполнить');
          toolbar.attachEvent('onclick', toolbar_click);

          // в зависимости от статуса
          set_editable(o, wnd);

        });

      /**
       *  статусбар с картинками
       */
      wnd.elmnts.statusbar = wnd.attachStatusBar();
      wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
    };

    attr.draw_pg_header = (o, wnd) => {

      function layout_resize_finish() {
        setTimeout(() => {
          if(wnd.elmnts && wnd.elmnts.layout_header && wnd.elmnts.layout_header.setSizes) {
            wnd.elmnts.layout_header.setSizes();
            wnd.elmnts.pg_left.objBox.style.width = '100%';
            wnd.elmnts.pg_right.objBox.style.width = '100%';
          }
        }, 200);
      }

      /**
       *  закладка шапка
       */
      wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

      wnd.elmnts.layout_header.attachEvent('onResizeFinish', layout_resize_finish);

      wnd.elmnts.layout_header.attachEvent('onPanelResizeFinish', layout_resize_finish);

      /**
       *  левая колонка шапки документа
       */
      wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
      wnd.elmnts.cell_left.hideHeader();
      wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          ' ': [
            {id: 'number_doc', path: 'o.number_doc', synonym: 'Номер', type: 'ro'},
            {id: 'date', path: 'o.date', synonym: 'Дата', type: 'ro', txt: moment(o.date).format(moment._masks.date_time)},
            'number_internal'
          ],
          'Контактная информация': [
            'partner',
            {id: 'client_of_dealer', path: 'o.client_of_dealer', synonym: 'Клиент дилера', type: 'client'},
            'phone',
            {id: 'shipping_address', path: 'o.shipping_address', synonym: 'Адрес доставки', type: 'addr'}
          ],
          'Дополнительные реквизиты': [
            'obj_delivery_state',
            'category',
            {id: 'manager', path: 'o.manager', synonym: 'Автор', type: 'ro'},
            'leading_manager'
          ]
        }
      });
      wnd.elmnts.pg_left.xcell_action = function (component, fld) {
        $p.dp.buyers_order.open_component(wnd, {
          ref: o.ref,
          cmd: fld,
          _mgr: _mgr,
        }, handlers, component);
      }

      /**
       *  правая колонка шапки документа
       * TODO: задействовать либо удалить choice_links
       * var choice_links = {contract: [
				 * {name: ["selection", "owner"], path: ["partner"]},
				 * {name: ["selection", "organization"], path: ["organization"]}
				 * ]};
       */

      wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
      wnd.elmnts.cell_right.hideHeader();
      wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          'Налоги': ['vat_consider', 'vat_included'],
          'Аналитика': ['project',
            {id: 'organization', path: 'o.organization', synonym: 'Организация', type: 'refc'},
            {id: 'contract', path: 'o.contract', synonym: 'Договор', type: 'refc'},
            {id: 'bank_account', path: 'o.bank_account', synonym: 'Счет организации', type: 'refc'},
            {id: 'department', path: 'o.department', synonym: 'Офис продаж', type: 'refc'},
            {id: 'warehouse', path: 'o.warehouse', synonym: 'Склад отгрузки', type: 'refc'},
          ],
          'Итоги': [{id: 'doc_currency', path: 'o.doc_currency', synonym: 'Валюта документа', type: 'ro', txt: o['doc_currency'].presentation},
            {id: 'doc_amount', path: 'o.doc_amount', synonym: 'Сумма', type: 'ron', txt: o['doc_amount']},
            {id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма внутр', type: 'ron', txt: o['amount_internal']}]
        }
      });

      /**
       *  редактор комментариев
       */
      wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
      wnd.elmnts.cell_note.hideHeader();
      wnd.elmnts.cell_note.setHeight(100);
      wnd.elmnts.cell_note.attachHTMLString('<textarea placeholder=\'Комментарий к заказу\' class=\'textarea_editor\'>' + o.note + '</textarea>');

    };

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_obj.xml'];

    attr.toolbar_click = toolbar_click;

    attr.on_close = frm_close;

    return this.constructor.prototype.form_obj.call(this, pwnd, attr)
      .then((res) => {
        if(res) {
          o = res.o;
          wnd = res.wnd;
          wnd.prompt = prompt;
          wnd.close_confirmed = true;
          if(handlers) {
            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          (o._data._reload ? o.load() : Promise.resolve())
            .then(() => {
              if(o._data._reload) {
                delete o._data._reload;
                _mgr.emit_async('rows', o, {'production': true});
              }
              return o.load_production();
            })
            .then(() => {
              rsvg_reload();
              o._manager.on('svgs', rsvg_reload);

              const search = $p.job_prm.parse_url_str(location.search);
              if(search.ref) {
                setTimeout(() => {
                  wnd.elmnts.tabs.tab_production && wnd.elmnts.tabs.tab_production.setActive();
                  rsvg_click(search.ref, 0);
                }, 200);
              };
            })
            .catch(() => {
              delete o._data._reload;
            });

          return res;
        }
      });

    /**
     * проверка, можно ли покидать страницу
     * @param loc
     * @return {*}
     */
    function prompt(loc) {
      if(loc.pathname.match(/builder/)) {
        return true;
      }
      return (o && o._modified) ? `${o.presentation} изменён.\n\nЗакрыть без сохранения?` : true;
    }

    function close() {
      if(o && o._obj) {
        const {ref, state} = o._obj;
        handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`);
      }
      else {
        handlers.handleNavigate(`/`);
      }
      $p.doc.calc_order.off('svgs', rsvg_reload);
    }

    /**
     * При активизации строки продукции
     * @param id
     * @param ind
     */
    function production_select(id, ind) {
      const row = o.production.get(id - 1);
      const {svgs, grids: {production}} = wnd.elmnts;
      wnd.elmnts.svgs.select(row.characteristic.ref);

      // если пользователь неполноправный, проверяем разрешение изменять цены номенклатуры
      if(production.columnIds[ind] === 'price') {
        const {current_user, CatParameters_keys, utils, enm: {comparison_types, parameters_keys_applying}} = $p;
        if(current_user.role_available('СогласованиеРасчетовЗаказов') || current_user.role_available('РедактированиеЦен')) {
          production.cells(id, ind).setDisabled(false);
        }
        else {
          const {nom} = row;
          let disabled = true;
          current_user.acl_objs.forEach(({acl_obj}) => {
            if(acl_obj instanceof CatParameters_keys && acl_obj.applying == parameters_keys_applying.Ценообразование) {
              acl_obj.params.forEach(({value, comparison_type}) => {
                if(utils.check_compare(nom, value, comparison_type, comparison_types)) {
                  return disabled = false;
                }
              });
              if(!disabled) {
                return disabled;
              }
            }
          });
          production.cells(id, ind).setDisabled(disabled);
        }
      }
    }

    /**
     * обработчик нажатия кнопок командных панелей
     */
    function toolbar_click(btn_id) {

      switch (btn_id) {

      case 'btn_sent':
        save('sent');
        break;

      case 'btn_save':
        save('save');
        break;

      case 'btn_save_close':
        save('close');
        break;

      case 'btn_retrieve':
        save('retrieve');
        break;

      case 'btn_reload':
        reload();
        break;

      case 'btn_post':
        save('post');
        break;

      case 'btn_unpost':
        save('unpost');
        break;

      case 'btn_fill_plan':
        o.fill_plan();
        break;

      case 'btn_close':
        close();
        break;

      case 'btn_add_builder':
        open_builder(true);
        break;

      case 'btn_clone':
        open_builder('clone');
        break;

      case 'btn_add_product':
        $p.dp.buyers_order.open_product_list(wnd, o);
        break;

      case 'btn_additions':
        $p.dp.buyers_order.open_component(wnd, o, handlers, 'CalcOrderAdditions');
        break;

      case 'btn_share':
        $p.dp.buyers_order.open_component(wnd, {ref: o.ref, cmd: btn_id}, handlers, 'PushUtils');
        break;

      case 'btn_add_material':
        add_material();
        break;

      case 'btn_edit':
        open_builder();
        break;

      case 'btn_recalc_row':
        recalc('row');
        break;

      case 'btn_recalc_doc':
        recalc('doc');
        break;

      case 'btn_spec':
        open_spec();
        break;

      case 'btn_discount':
        show_discount();
        break;

      case 'btn_calendar':
        calendar_new_event();
        break;

      case 'btn_go_connection':
        go_connection();
        break;

      case 'calc_order':
        clone_calc_order(o);
        break;
      }

      if(btn_id.substr(0, 4) == 'prn_') {
        _mgr.print(o, btn_id, wnd);
      }
    }

    /**
     * создаёт событие календаря
     */
    function calendar_new_event() {
      $p.msg.show_not_implemented();
    }

    /**
     * показывает список связанных документов
     */
    function go_connection() {
      $p.msg.show_not_implemented();
    }

    /**
     * копирует заказ
     * @param o
     * @return {undefined}
     */
    function clone_calc_order(o) {
      const {_manager} = o;
      if(o._modified) {
        return $p.msg.show_msg({
          title: o.presentation,
          type: 'alert-warning',
          text: 'Документ изменён.<br />Перед созданием копии сохраните заказ'
        });
      };
      handlers.handleNavigate(`/login`);
      _manager.clone(o)
        .then((doc) => {
          handlers.handleNavigate(`/${_manager.class_name}/${doc.ref}`);
        })
        .catch((err) => {
          $p.record_log(err);
          handlers.handleNavigate(`/`);
        });
    }

    /**
     * создаёт и показывает диалог групповых скидок
     */
    function show_discount() {

      if(!wnd.elmnts.discount) {
        wnd.elmnts.discount = $p.dp.buyers_order.create();
      }
      // перезаполняем
      refill_discount(wnd.elmnts.discount);

      const discount = $p.iface.dat_blank(null, {
        width: 300,
        height: 220,
        allow_close: true,
        allow_minmax: false,
        caption: 'Скидки по группам'
      });
      discount.setModal(true);

      discount.attachTabular({
        obj: wnd.elmnts.discount,
        ts: 'charges_discounts',
        reorder: false,
        disable_add_del: true,
        toolbar_struct: $p.injected_data['toolbar_discounts.xml'],
        ts_captions: {
          'fields': ['nom_kind', 'discount_percent'],
          'headers': 'Группа,Скидка',
          'widths': '*,80',
          'min_widths': '120,70',
          'aligns': '',
          'sortings': 'na,na',
          'types': 'ro,calck'
        },
      });
      const toolbar = discount.getAttachedToolbar();
      toolbar.attachEvent('onclick', (btn) => {
        wnd.elmnts.discount._mode = btn;
        refill_discount(wnd.elmnts.discount);
        toolbar.setItemText('bs', toolbar.getListOptionText('bs', btn));
      });
      if(wnd.elmnts.discount._disable_internal) {
        toolbar.disableListOption('bs', 'discount_percent');
      }
      toolbar.setItemText('bs', toolbar.getListOptionText('bs', wnd.elmnts.discount._mode));
    }

    function refill_discount(dp) {

      if(!dp._mode) {
        dp._disable_internal = !$p.current_user.role_available('РедактированиеСкидок');
        dp._mode = dp._disable_internal ? 'discount_percent_internal' : 'discount_percent';
        dp._calc_order = o;
      }

      const {charges_discounts} = dp;
      const groups = new Set();
      dp._data._loading = true;
      charges_discounts.clear();
      o.production.forEach((row) => {
        const group = {nom_kind: row.nom.nom_kind};
        if(!groups.has(group.nom_kind)) {
          groups.add(group.nom_kind);
          charges_discounts.add(group);
        }
        charges_discounts.find_rows(group, (sub) => {
          const percent = row[dp._mode];
          if(percent > sub.discount_percent) {
            sub.discount_percent = percent;
          }
        });
      });
      dp._data._loading = false;
      dp._manager.emit_async('rows', dp, {'charges_discounts': true});
    }


    /**
     * вспомогательные функции
     */

    function production_get_sel_index() {
      var selId = wnd.elmnts.grids.production.getSelectedRowId();
      if(selId && !isNaN(Number(selId))) {
        return Number(selId) - 1;
      }

      $p.msg.show_msg({
        type: 'alert-warning',
        text: $p.msg.no_selected_row.replace('%1', 'Продукция'),
        title: o.presentation
      });
    }

    function reload() {
      o && o.load()
        .then(() => o.load_production(true))
        .then(() => {
          const {pg_left, pg_right, grids} = wnd.elmnts;
          pg_left.reload();
          pg_right.reload();
          grids.production.selection = grids.production.selection;
          wnd.set_text();
        });
    }

    function save(action) {

      function do_save(post) {

        if(!wnd.elmnts.ro) {
          o.note = wnd.elmnts.cell_note.cell.querySelector('textarea').value.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '').replace(/&.{2,6};/g, '');
          wnd.elmnts.pg_left.selectRow(0);
        }

        o.save(post)
          .then(() => {
            if(action == 'sent' || action == 'close') {
              close();
            }
            else {
              wnd.set_text();
              set_editable(o, wnd);
            }
          })
          .catch((err) => {
            if(err._rev) {
              // показать диалог и обработать возврат
              dhtmlx.confirm({
                title: o.presentation,
                text: err.message + '<div style="text-align: left;padding-top: 16px;">Ваши правки потеряны, можно закрыть форму либо прочитать актуальную версию заказа с сервера</div>',
                cancel: 'Прочитать',
                callback: (btn) => {
                  btn === false && reload();
                }
              });
            }
            else {
              $p.msg.show_msg({
                type: 'alert-warning',
                text: err.message || err,
                title: o.presentation
              });
            }
          });
      }

      switch (action) {
      case 'sent':
        // показать диалог и обработать возврат
        dhtmlx.confirm({
          title: $p.msg.order_sent_title,
          text: $p.msg.order_sent_message,
          cancel: $p.msg.cancel,
          callback: function (btn) {
            if(btn) {
              // установить транспорт в "отправлено" и записать
              o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
              do_save();
            }
          }
        });
        break;

      case 'retrieve':
        // установить транспорт в "отозвано" и записать
        o.obj_delivery_state = $p.enm.obj_delivery_states.Отозван;
        do_save();
        break;

      case 'post':
        do_save(true);
        break;

      case 'unpost':
        do_save(false);
        break;

      default:
        do_save();
      }
    }

    function frm_close() {

      // if(o && !location.pathname.match(/builder/)) {
      //   // при закрыти формы не в рисовалку, выгружаем заказ и его продукции из памяти
      //   setTimeout(o.unload.bind(o), 200);
      // }

      // выгружаем из памяти всплывающие окна скидки и связанных файлов
      ['vault', 'vault_pop', 'discount', 'svgs', 'layout_header'].forEach((elm) => {
        wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
      });

      return true;
    }

    // устанавливает видимость и доступность
    function set_editable(o, wnd) {

      const {pg_left, pg_right, frm_toolbar, grids, tabs} = wnd.elmnts;

      pg_right.cells('vat_consider', 1).setDisabled(true);
      pg_right.cells('vat_included', 1).setDisabled(true);

      const ro = wnd.elmnts.ro = o.is_read_only;
      const {enm: {obj_delivery_states: {Отправлен, Отклонен, Шаблон}}, current_user} = $p;

      const retrieve_enabed = !o._deleted &&
        (o.obj_delivery_state == Отправлен || o.obj_delivery_state == Отклонен);

      grids.production.setEditable(!ro);
      grids.planning.setEditable(!ro);
      pg_left.setEditable(!ro);
      pg_right.setEditable(!ro);

      // гасим кнопки проведения, если недоступна роль
      if(!current_user.role_available('СогласованиеРасчетовЗаказов')) {
        frm_toolbar.hideItem('btn_post');
        frm_toolbar.hideItem('btn_unpost');
      }

      // если не технологи и не менеджер - запрещаем менять статусы
      if(!current_user.role_available('ИзменениеТехнологическойНСИ') && !current_user.role_available('СогласованиеРасчетовЗаказов')) {
        pg_left.cells('obj_delivery_state', 1).setDisabled(true);
      }

      // кнопки записи и отправки гасим в зависимости от статуса
      if(ro) {
        frm_toolbar.disableItem('btn_sent');
        frm_toolbar.disableItem('btn_save');
        frm_toolbar.disableItem('btn_save_close');
        let toolbar;
        const disable = (itemId) => toolbar.disableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(disable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(disable);
      }
      else {
        // шаблоны никогда не надо отправлять
        if(o.obj_delivery_state == Шаблон) {
          frm_toolbar.disableItem('btn_sent');
        }
        else {
          frm_toolbar.enableItem('btn_sent');
        }
        frm_toolbar.enableItem('btn_save');
        frm_toolbar.enableItem('btn_save_close');
        let toolbar;
        const enable = (itemId) => toolbar.enableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(enable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(enable);
      }
      if(retrieve_enabed) {
        frm_toolbar.enableListOption('bs_more', 'btn_retrieve');
      }
      else {
        frm_toolbar.disableListOption('bs_more', 'btn_retrieve');
      }
    }

    /**
     * показывает диалог с сообщением "это не продукция"
     */
    function not_production() {
      const {msg} = $p;
      msg.show_msg({
        title: msg.bld_title,
        type: 'alert-error',
        text: msg.bld_not_product
      });
    }

    /**
     * Пересчитывает строку или весь заказ
     * @param [mode] {String} - если 'row' - пересчет строки
     */
    function recalc(mode) {
      if(mode == 'row') {
        const selId = production_get_sel_index();
        if(selId == undefined) {
          return not_production();
        }
        const row = o.production.get(selId);
        if(row) {
          const {owner, calc_order} = row.characteristic;
          let ox;
          if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
            return not_production();
          }
          else if(row.characteristic.coordinates.count() == 0) {
            // возможно, это подчиненная продукция
            if(row.characteristic.leading_product.calc_order == calc_order) {
              ox = row.characteristic.leading_product;
            }
          }
          else {
            ox = row.characteristic;
          }
          if(ox) {
            wnd.progressOn();
            ox.recalc()
              .catch((err) => {
                $p.msg.show_msg({
                  title: $p.msg.bld_title,
                  type: 'alert-error',
                  text: err.stack || err.message
                });
              })
              .then(() => wnd.progressOff());
          }
        }
      }
      else {
        wnd.progressOn();
        o.recalc()
          .catch((err) => {
            $p.msg.show_msg({
              title: $p.msg.bld_title,
              type: 'alert-error',
              text: err.stack || err.message
            });
          })
          .then(() => wnd.progressOff());
      }
    }

    /**
     * ОткрытьПостроитель()
     * @param [create_new] {Boolean} - создавать новое изделие или открывать в текущей строке
     */
    function open_builder(create_new) {

      if(create_new == 'clone') {
        const selId = production_get_sel_index();
        if(selId == undefined) {
          not_production();
        }
        else {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count()) {
              // добавляем строку
              o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
                .then(({characteristic}) => {
                  // заполняем продукцию копией данных текущей строки
                  characteristic._mixin(row.characteristic._obj, null,
                    'ref,name,calc_order,product,leading_product,leading_elm,origin,note,partner'.split(','), true);
                  handlers.handleNavigate(`/builder/${characteristic.ref}`);
                });
            }
            else {
              not_production();
            }
          }
        }

      }
      else if(create_new) {
        o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
          .then((row) => {
            handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
          });
      }
      else {
        const selId = production_get_sel_index();
        if(selId != undefined) {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count() == 0) {
              // возможно, это заготовка - проверим номенклатуру системы
              if(row.characteristic.leading_product.calc_order == calc_order) {
                //$p.iface.set_hash("cat.characteristics", row.characteristic.leading_product.ref, "builder");
                handlers.handleNavigate(`/builder/${row.characteristic.leading_product.ref}`);
              }
            }
            else {
              //$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
              handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
            }
          }
        }
      }

    }

    /**
     * Открывает форму спецификации текущей строки
     */
    function open_spec() {
      const selId = production_get_sel_index();
      if(selId != undefined) {
        const row = o.production.get(selId);
        row && !row.characteristic.empty() && row.characteristic.form_obj().then((w) => w.wnd.maximize());
      }
    }

    function rsvg_reload() {
      o && wnd && wnd.elmnts && wnd.elmnts.svgs && wnd.elmnts.svgs.reload(o);
    }

    function rsvg_click(ref, dbl) {
      const {production} = wnd.elmnts.grids;
      production && o.production.find_rows({characteristic: ref}, (row) => {
        production.selectRow(row.row - 1, dbl === 0);
        dbl && open_builder();
        return false;
      });
    }

    /**
     * добавляет строку материала
     */
    function add_material() {
      const {production} = wnd.elmnts.grids;
      const row = o.create_product_row({grid: production}).row - 1;
      setTimeout(() => {
        production.selectRow(row);
        production.selectCell(row, production.getColIndexById('nom'), false, true, true);
        production.cells().open_selection();
      });
    }

  };

})($p);
