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
      elmnts.toolbar.addButtonTwoState('by_number', pos, '<i class="fa fa-key fa-fw"></i>');
      if($p.wsql.get_user_param('calc_order_by_number', 'boolean')) {
        elmnts.toolbar.setItemState('by_number', true);
      }
      elmnts.toolbar.setItemToolTip('by_number', 'Режим поиска с учетом либо без учета статуса и подразделения');
      elmnts.toolbar.attachEvent('onStateChange', (id, state) => {
        $p.wsql.set_user_param('calc_order_by_number', state);
        elmnts.filter.call_event();
      });

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
      elmnts.filter.custom_selection.__define({
        department: {
          get() {
            const {department} = dp;
            return this._state == 'template' ? {$eq: $p.utils.blank.guid} : {$eq: department.ref};
            // const depts = [];
            // $p.cat.divisions.forEach((o) =>{
            //   if(o._hierarchy(department)){
            //     depts.push(o.ref)
            //   }
            // });
            // return depts.length == 1 ?  {$eq: depts[0]} : {$in: depts};
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
            if($p.wsql.get_user_param('calc_order_by_number', 'boolean')) {
              const flt = elmnts.filter.get_filter();
              if(flt.filter.length > 5) {
                return [{class_name: 'desc'}, {date: 'desc'}, {search: 'desc'}];
              }
            }
            return [{department: 'desc'}, {state: 'desc'}, {date: 'desc'}];
          }
        },

        // индекс может зависеть от ...
        _index: {
          get() {
            if($p.wsql.get_user_param('calc_order_by_number', 'boolean')) {
              const flt = elmnts.filter.get_filter();
              if(flt.filter.length > 5) {
                return {
                  ddoc: ['mango', 'search'],
                  fields: ['class_name', 'date', 'search']
                };
              }
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
        switch (btn_id) {

        case 'calc_order':
          const ref = wnd.elmnts.grid.getSelectedRowId();
          if(ref) {
            const {calc_order} = $p.doc;
            calc_order.clone(ref)
              .then((doc) => {
                handlers.handleNavigate(`/${calc_order.class_name}/${doc.ref}`);
              })
              .catch($p.record_log);
            ;
          }
          else {
            $p.msg.show_msg({
              type: 'alert-warning',
              text: $p.msg.no_selected_row.replace('%1', ''),
              title: $p.msg.main_title
            });
          }
          break;

        case 'btn_download':
        case 'btn_share':
        case 'btn_inbox':
          $p.dp.buyers_order.open_component(wnd, {
            ref: wnd.elmnts.grid.getSelectedRowId(),
            cmd: btn_id
          }, handlers, 'PushUtils', 'CalcOrderList');
          break;

        }
      }

      resolve(wnd);
    }

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_selection.xml'];



    return this.mango_selection(pwnd, attr);

  });

};

