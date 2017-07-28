/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order_form_list
 */


$p.doc.calc_order.form_list = function(pwnd, attr, handlers){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
			date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
			on_new: (o) => {
        handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
			  //$p.iface.set_hash(this.class_name, o.ref, "doc");
			},
			on_edit: (_mgr, rId) => {
        handlers.handleNavigate(`/${_mgr.class_name}/${rId}`);
				//$p.iface.set_hash(_mgr.class_name, rId, "doc");
			}
		};
	}

  return this.pouch_db.getIndexes()
    .then(({indexes}) => {
      attr._index = {
        ddoc: "mango_calc_order",
        fields: ["department", "state", "date", "search"],
        name: 'list',
        type: 'json',
      };
      if(!indexes.some(({ddoc}) => ddoc && ddoc.indexOf(attr._index.ddoc) != -1)){
        return this.pouch_db.createIndex(attr._index);
      }
    })
    .then(() => {
      return new Promise((resolve, reject) => {

        attr.on_create = (wnd) => {

          const {elmnts} = wnd;

          wnd.dep_listener = (obj, fields) => {
            if(obj == dp && fields.department){
              elmnts.filter.call_event();
              $p.wsql.set_user_param("current_department", dp.department.ref);
            }
          }

          // добавляем слушателя внешних событий
          if(handlers){
            const {custom_selection} = elmnts.filter;
            custom_selection._state = handlers.props.state_filter;
            handlers.onProps = (props) => {
              if(custom_selection._state != props.state_filter){
                custom_selection._state = props.state_filter;
                elmnts.filter.call_event();
              }
            }
          }

          // добавляем отбор по подразделению
          const dp = $p.dp.builder_price.create();
          const pos = elmnts.toolbar.getPosition("input_filter");
          const txt_id = `txt_${dhx4.newId()}`;
          elmnts.toolbar.addText(txt_id, pos, "");
          const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
          const dep = new $p.iface.OCombo({
            parent: txt_div,
            obj: dp,
            field: "department",
            width: 180,
            hide_frm: true,
          });
          txt_div.style.border = "1px solid #ccc";
          txt_div.style.borderRadius = "3px";
          txt_div.style.padding = "3px 2px 1px 2px";
          txt_div.style.margin = "1px 5px 1px 1px";
          dep.DOMelem_input.placeholder = "Подразделение";

          dp._manager.on('update', wnd.dep_listener);

          const set_department = $p.DocCalc_order.set_department.bind(dp);
          set_department();
          if(!$p.wsql.get_user_param('couch_direct')){
            $p.once({user_log_in: set_department});
          }

          // настраиваем фильтр для списка заказов
          elmnts.filter.custom_selection.__define({
            department: {
              get: function () {
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
              get: function(){
                return this._state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: this._state};
              },
              enumerable: true
            }
          });
          elmnts.filter.custom_selection._index = attr._index;

          // картинка заказа в статусбаре
          elmnts.status_bar = wnd.attachStatusBar();
          elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
            (ref, dbl) => {
              //dbl && $p.iface.set_hash("cat.characteristics", ref, "builder")
              dbl && handlers.handleNavigate(`/builder/${ref}`);
            });
          elmnts.grid.attachEvent("onRowSelect", (rid) => elmnts.svgs.reload(rid));

          wnd.attachEvent("onClose", (win) => {
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

          resolve(wnd);
        }

        return this.mango_selection(pwnd, attr);

      });
    });

};

