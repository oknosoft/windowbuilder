/**
 * ### Дополнительные методы справочника Цвета
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_cnns
 *
 * Created 23.12.2015
 */

$p.cat.clrs.__define({

	/**
	 * ПолучитьЦветПоПредопределенномуЦвету
	 * @param clr {CatClrs} - цвет исходной строки соединения, фурнитуры или вставки
	 * @param clr_elm {CatClrs} - цвет элемента
	 * @param clr_sch {CatClrs} - цвет изделия
	 * @return {*}
	 */
	by_predefined: {
		value: function(clr, clr_elm, clr_sch){
		  const {predefined_name} = clr;
			if(predefined_name){
			  switch (predefined_name){
          case 'КакЭлемент':
            return clr_elm;
          case 'КакИзделие':
            return clr_sch;
          case 'КакЭлементСнаружи':
            return clr_elm.clr_out.empty() ? clr_elm : clr_elm.clr_out;
          case 'КакЭлементИзнутри':
            return clr_elm.clr_in.empty() ? clr_elm : clr_elm.clr_in;
          case 'КакИзделиеСнаружи':
            return clr_sch.clr_out.empty() ? clr_sch : clr_sch.clr_out;
          case 'КакИзделиеИзнутри':
            return clr_sch.clr_in.empty() ? clr_sch : clr_sch.clr_in;
          case 'КакЭлементИнверсный':
            return this.inverted(clr_elm);
          case 'КакИзделиеИнверсный':
            return this.inverted(clr_sch);
          case 'БезЦвета':
            return this.get();
          default :
            return clr_elm;
        }
			}
      return clr.empty() ? clr_elm : clr
		}
	},

  /**
   * ### Инверсный цвет
   * Возвращает элемент, цвета которого изнутри и снаружи перевёрнуты местами
   * @param clr {CatClrs} - исходный цвет
   */
  inverted: {
    value: function(clr){
      if(clr.clr_in == clr.clr_out || clr.clr_in.empty() || clr.clr_out.empty()){
        return clr;
      }
      // ищем в справочнике цветов
      const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
        [this.alatable, clr.clr_out.ref, clr.clr_in.ref, $p.utils.blank.guid]);
      return ares.length ? this.get(ares[0]) : clr
    }
  },

	/**
	 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
	 * @param mf {Object} - описание метаданных поля
	 */
	selection_exclude_service: {
		value: function (mf, sys) {

			if(mf.choice_params)
				mf.choice_params.length = 0;
			else
				mf.choice_params = [];

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});

			if(sys){
				mf.choice_params.push({
					name: "ref",
					get path(){

						var clr_group, elm, res = [];

						if(sys instanceof $p.Editor.BuilderElement){
							clr_group = sys.inset.clr_group;
							if(clr_group.empty() && !(sys instanceof $p.Editor.Filling))
								clr_group = sys.project._dp.sys.clr_group;

						}else if(sys instanceof $p.DataProcessorObj){
							clr_group = sys.sys.clr_group;

						}else{
							clr_group = sys.clr_group;

						}

						if(clr_group.empty() || !clr_group.clr_conformity.count()){
							$p.cat.clrs.alatable.forEach(function (row) {
								if(!row.is_folder)
									res.push(row.ref);
							})
						}else{
							$p.cat.clrs.alatable.forEach(function (row) {
								if(!row.is_folder){
									if(clr_group.clr_conformity._obj.some(function (cg) {
											return row.parent == cg.clr1 || row.ref == cg.clr1;
										}))
										res.push(row.ref);
								}
							})
						}
						return {in: res};
					}
				});
			}


		}
	},

	/**
	 * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
	 */
	form_selection: {
		value: function (pwnd, attr) {

		  const eclr = this.get();

			attr.hide_filter = true;

      attr.toolbar_click = function (btn_id, wnd){

        // если указаны оба цвета
        if(btn_id=="btn_select" && !eclr.clr_in.empty() && !eclr.clr_out.empty()) {

          // ищем в справочнике цветов
          const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
            [$p.cat.clrs.alatable, eclr.clr_in.ref, eclr.clr_out.ref, $p.utils.blank.guid]);

          // если не нашли - создаём
          if(ares.length){
            pwnd.on_select.call(pwnd, $p.cat.clrs.get(ares[0]));
          }
          else{
            $p.cat.clrs.create({
              clr_in: eclr.clr_in,
              clr_out: eclr.clr_out,
              name: eclr.clr_in.name + " \\ " + eclr.clr_out.name,
              parent: $p.job_prm.builder.composite_clr_folder
            })
              .then(function (obj) {
                // регистрируем цвет в couchdb
                return obj.register_on_server()
              })
              .then(function (obj) {
                pwnd.on_select.call(pwnd, obj);
              })
              .catch(function (err) {
                $p.msg.show_msg({
                  type: "alert-warning",
                  text: "Недостаточно прав для добавления составного цвета",
                  title: "Составной цвет"
                });
              })
          }

          wnd.close();
          return false;
        }
      }

      const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);


			function get_option_list(val, selection) {

				selection.clr_in = $p.utils.blank.guid;
				selection.clr_out = $p.utils.blank.guid;

				if(attr.selection){
					attr.selection.some((sel) => {
						for(var key in sel){
							if(key == "ref"){
								selection.ref = sel.ref;
								return true;
							}
						}
					});
				}

				return this.constructor.prototype.get_option_list.call(this, val, selection);
			}

			return (wnd instanceof Promise ? wnd : Promise.resolve(wnd))
				.then((wnd) => {

					const tb_filter = wnd.elmnts.filter;

					tb_filter.__define({
						get_filter: {
							value: () => {
								const res = {
									selection: []
								};
								if(clr_in.getSelectedValue())
									res.selection.push({clr_in: clr_in.getSelectedValue()});
								if(clr_out.getSelectedValue())
									res.selection.push({clr_out: clr_out.getSelectedValue()});
								if(res.selection.length)
									res.hide_tree = true;
								return res;
							}
						}
					});

					wnd.attachEvent("onClose", () => {

						clr_in.unload();
						clr_out.unload();

						eclr.clr_in = $p.utils.blank.guid;
						eclr.clr_out = $p.utils.blank.guid;

						return true;
					});

					Object.unobserve(eclr);

					eclr.clr_in = $p.utils.blank.guid;
					eclr.clr_out = $p.utils.blank.guid;

					// Создаём элементы управления
					const clr_in = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_in",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});
					const clr_out = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_out",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});

					clr_in.DOMelem.style.float = "left";
					clr_in.DOMelem_input.placeholder = "Цвет изнутри";
					clr_out.DOMelem_input.placeholder = "Цвет снаружи";

					clr_in.attachEvent("onChange", tb_filter.call_event);
					clr_out.attachEvent("onChange", tb_filter.call_event);
					clr_in.attachEvent("onClose", tb_filter.call_event);
					clr_out.attachEvent("onClose", tb_filter.call_event);

					// гасим кнопки управления
          wnd.elmnts.toolbar.hideItem("btn_new");
          wnd.elmnts.toolbar.hideItem("btn_edit");
          wnd.elmnts.toolbar.hideItem("btn_delete");

          wnd.elmnts.toolbar.setItemText("btn_select", "<b>Выбрать или создать</b>");

					return wnd;

				})
		}
	},

	/**
	 * Изменяем алгоритм построения формы списка. Игнорируем иерархию, если указаны цвета изнутри или снаружи
	 */
	sync_grid: {
		value: function(attr, grid) {

			if(attr.action == "get_selection" && attr.selection && attr.selection.some(function (v) {
				return v.hasOwnProperty("clr_in") || v.hasOwnProperty("clr_out");
				})){
				delete attr.parent;
				delete attr.initial_value;
			}

			return $p.DataManager.prototype.sync_grid.call(this, attr, grid);
		}
	}
});


$p.CatClrs.prototype.__define({

  // записывает элемент цвета на сервере
  register_on_server: {
    value: function () {
      return $p.wsql.pouch.save_obj(this, {
        db: $p.wsql.pouch.remote.ram
      })
        .then(function (obj) {
          return obj.save();
        })
    }
  },

  // возвращает стороны, на которых цвет
  sides: {
    get: function () {
      const res = {is_in: false, is_out: false};
      if(!this.empty() && !this.predefined_name){
        if(this.clr_in.empty() && this.clr_out.empty()){
          res.is_in = res.is_out = true;
        }
        else{
          if(!this.clr_in.empty() && !this.clr_in.predefined_name){
            res.is_in = true;
          }
          if(!this.clr_out.empty() && !this.clr_out.predefined_name){
            res.is_out = true;
          }
        }
      }
      return res;
    }
  }

});

