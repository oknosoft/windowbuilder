/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order_form_list
 */


$p.doc.calc_order.form_list = function(pwnd, attr, handlers){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: moment().subtract(2, 'month').toDate(),
			date_till: moment().add(1, 'month').toDate(),
			on_new: (o) => {
        handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
			},
			on_edit: (_mgr, ref) => {
        handlers.handleNavigate(`/${_mgr.class_name}/${ref}`);
			}
		};
	}

  return new Promise((resolve, reject) => {

    attr._index = {
      ddoc: ['mango_calc_order', 'list'],
      fields: ['department', 'state', 'date', 'search']
    };

    attr.on_create = (wnd) => {

      const {elmnts} = wnd;

      wnd.dep_listener = (obj, fields) => {
        if(obj == dp && fields.department){
          elmnts.filter.call_event();
          $p.wsql.set_user_param('current_department', dp.department.ref);
        }
      }

      // добавляем слушателя внешних событий
      if(handlers){
        const {custom_selection} = elmnts.filter;
        custom_selection._state = handlers.props.state_filter;
        custom_selection.class_name = 'doc.calc_order';
        handlers.onProps = (props) => {
          if(custom_selection._state != props.state_filter){
            custom_selection._state = props.state_filter;
            elmnts.filter.call_event();
          }
          if(elmnts.toolbar) {
            if(custom_selection._state === 'draft') {
              elmnts.toolbar.enableItem('btn_delete');
            }
            else {
              elmnts.toolbar.disableItem('btn_delete');
            }
          }
        }

        wnd.handleNavigate = handlers.handleNavigate;
        wnd.handleIfaceState = handlers.handleIfaceState;
      }

      // добавляем отбор по подразделению
      const dp = $p.dp.builder_price.create();
      const pos = elmnts.toolbar.getPosition('input_filter');

      // кнопка поиска по номеру
      // elmnts.toolbar.addButtonTwoState('by_number', pos, '<i class="fa fa-key fa-fw"></i>');
      // if($p.wsql.get_user_param('calc_order_by_number', 'boolean')) {
      //   elmnts.toolbar.setItemState('by_number', true);
      // }
      // elmnts.toolbar.setItemToolTip('by_number', 'Режим поиска с учетом либо без учета статуса и подразделения');
      // elmnts.toolbar.attachEvent('onStateChange', (id, state) => {
      //   $p.wsql.set_user_param('calc_order_by_number', state);
      //   elmnts.filter.call_event();
      // });

      const txt_id = `txt_${dhx4.newId()}`;
      elmnts.toolbar.addText(txt_id, pos, '');
      const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
      const dep = new $p.iface.OCombo({
        parent: txt_div,
        obj: dp,
        field: 'department',
        width: 180,
        hide_frm: true,
      });
      txt_div.style.border = '1px solid #ccc';
      txt_div.style.borderRadius = '3px';
      txt_div.style.padding = '3px 2px 1px 2px';
      txt_div.style.margin = '1px 5px 1px 1px';
      dep.DOMelem_input.placeholder = 'Подразделение';

      dp._manager.on('update', wnd.dep_listener);

      const set_department = $p.DocCalc_order.set_department.bind(dp);
      set_department();
      if(!$p.wsql.get_user_param('couch_direct')){
        $p.md.once('user_log_in', set_department);
      }

      // настраиваем фильтр для списка заказов
      elmnts.filter.disable_timer = true;
      elmnts.filter.custom_selection.__define({
        department: {
          get() {
            const {department} = dp;
            return this._state == 'template' ? {$eq: $p.utils.blank.guid} : {$eq: department.ref};
          },
          enumerable: true
        },
        state: {
          get(){
            return this._state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: this._state};
          },
          enumerable: true
        },

        // sort может зависеть от ...
        _sort: {
          get() {
            return [{department: 'desc'}, {state: 'desc'}, {date: 'desc'}];
          }
        },

        // индекс может зависеть от ...
        _index: {
          value(start, count) {
            const {filter, date_till} = elmnts.filter.get_filter();

            // шаблоны берём из ОЗУ, к серверу не обращаемся
            if(this._state === 'template') {
              const {utils, doc: {calc_order}} = $p;
              const res = utils._find_rows_with_sort(calc_order, {
                _top: count,
                _skip: start,
                obj_delivery_state: 'Шаблон'
              });
              res.docs = res.docs.sort(utils.sort('date', 'desc')).map(v => Object.assign({_id: `doc.calc_order|${v.ref}`}, v._obj));
              return Promise.resolve(res);
            }
            // строку, в которой 11 символов, из которых не менее 6 числа, считаем номером
            if(filter.length === 11 && filter.replace(/\D/g, '').length > 5) {
              const {doc} = $p.adapters.pouch.local;
              return doc.query('doc/number_doc', {
                include_docs: true,
                key: ['doc.calc_order', date_till.getFullYear(), filter]
              })
                .then(({rows}) => {
                  return rows.length ? {rows} : doc.query('doc/number_doc', {
                    include_docs: true,
                    key: ['doc.calc_order', date_till.getFullYear() - 1, filter]
                  })
                })
                .then(({rows}) => {
                  return {docs: rows.map((v) => v.doc)};
                });
            }
            return attr._index;
          }
        },

      });

      // картинка заказа в статусбаре
      elmnts.status_bar = wnd.attachStatusBar();
      elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
        (ref, dbl) => {
          //dbl && $p.iface.set_hash("cat.characteristics", ref, "builder")
          dbl && handlers.handleNavigate(`/builder/${ref}`);
        });
      elmnts.grid.attachEvent('onRowSelect', (rid) => elmnts.svgs.reload(rid));

      wnd.attachEvent('onClose', (win) => {
        dep && dep.unload();
        return true;
      });

      attr.on_close = () => {
        elmnts.svgs && elmnts.svgs.unload();
        dep && dep.unload();
      }

      // wnd.close = (on_create) => {
      //
      //   if (wnd) {
      //     wnd.getAttachedToolbar().clearAll();
      //     wnd.detachToolbar();
      //     wnd.detachStatusBar();
      //     if (wnd.conf) {
      //       wnd.conf.unloading = true;
      //     }
      //     wnd.detachObject(true);
      //   }
      //   this.frm_unload(on_create);
      // }


      /**
       * обработчик нажатия кнопок командных панелей
       */
      attr.toolbar_click = function toolbar_click(btn_id) {
        const {msg, ui, dp, doc: {calc_order}, enm} = $p;
        const {grid} = elmnts;
        const ref = grid.getSelectedRowId();

        switch (btn_id) {

        case 'calc_order':
          if(ref) {
            handlers.handleIfaceState({
              component: '',
              name: 'repl',
              value: {root: {title: 'Длительная операция', text: 'Копирование и пересчет заказа'}},
            });
            handlers.handleNavigate(`/waiting`);
            calc_order.clone(ref)
              .then((doc) => {
                handlers.handleNavigate(`/${calc_order.class_name}/${doc.ref}`);
              })
              .catch((err) => {
                handlers.handleNavigate(`/?ref=${ref}`);
                ui.dialogs.alert({title: msg.main_title, text: err.message});
              });
            ;
          }
          else {
            ui.dialogs.alert({title: msg.main_title, text: msg.no_selected_row.replace('%1', '')});
          }
          break;

        case 'btn_download':
        case 'btn_share':
        case 'btn_inbox':
          dp.buyers_order.open_component(wnd, {
            ref: grid.getSelectedRowId(),
            cmd: btn_id
          }, handlers, 'PushUtils', 'CalcOrderList');
          break;

        case 'btn_history':
          if(ref) {
            calc_order.get(ref, 'promise')
              .then((o) => {
                const area = 'CalcOrderList';
                dp.buyers_order.open_component(wnd, {ref, cmd: {hfields: null, db: null, area}, _mgr: calc_order}, handlers, 'ObjHistory', area);
              });
          }
          break;

        case 'btn_delete':
          if(ref) {
            calc_order.get(ref, 'promise')
              .then((o) => {
                return ui.dialogs.confirm({
                  title: msg.main_title,
                  text: `Перенести ${o.presentation} в архив?`
                })
                  .then(() => o)
                  .catch(() => null);
              })
              .then((o) => {
                if(o) {
                  wnd.progressOn();
                  o.obj_delivery_state = enm.obj_delivery_states.Архив;
                  return o.save();
                }
              })
              .then((o) => {
                o && attr._frm_list.reload();
                wnd.progressOff();
              })
              .catch((err) => {
                wnd.progressOff();
                ui.dialogs.alert({title: msg.main_title, text: err ? err.message || err.reason : 'Ошибка при помещении заказа в архив'});
              });

          }
          else {
            ui.dialogs.alert({title: msg.main_title, text: msg.no_selected_row.replace('%1', '')});
          }
          return false;

        }
      }

      resolve(wnd);
    }

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_selection.xml'];

    const _frm_list = this.mango_selection(pwnd, attr);
    return attr._frm_list = _frm_list;

  });

};

