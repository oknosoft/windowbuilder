/**
 * ### Дополнительные методы справочника Цвета
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_cnns
 * Created 23.12.2015
 */

$p.cat.clrs.__define({

	/**
	 * ПолучитьЦветПоПредопределенномуЦвету
	 * @param clr
	 * @param clr_elm
	 * @param clr_sch
	 * @return {*}
	 */
	by_predefined: {
		value: function(clr, clr_elm, clr_sch){
			if(clr.predefined_name){
				return clr_elm;
			}else if(clr.empty())
				return clr_elm;
			else
				return clr;
		}
	},

	/**
	 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
	 * @param mf {Object} - описание метаданных поля
	 */
	selection_exclude_service: {
		value: function (mf, sys) {

			if(!mf.choice_params)
				mf.choice_params = [];

			if(mf.choice_params.some(function (ch) {
					if(ch.name == "parent")
						return true;
				}))
				return;

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});
		}
	},

	/**
	 * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
	 */
	form_selection: {
		value: function (pwnd, attr) {

			attr.hide_filter = true;

			var wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr),
				toolbar = wnd.elmnts.filter,
				eclr = this.get($p.utils.blank.guid, false, true);

			function get_option_list(val, selection) {

				selection.clr_in = $p.utils.blank.guid;
				selection.clr_out = $p.utils.blank.guid;
				
				return this.constructor.prototype.get_option_list.call(this, val, selection);
			}

			toolbar.__define({
				get_filter: {
					value: function () {
						var res = {
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

			wnd.attachEvent("onClose", function(){

				clr_in.unload();
				clr_out.unload();

				return true;
			});

			Object.unobserve(eclr);

			// Создаём элементы управления
			var clr_in = new $p.iface.OCombo({
				parent: toolbar.div.obj,
				obj: eclr,
				field: "clr_in",
				width: 150,
				hide_frm: true,
				get_option_list: get_option_list
			}), clr_out = new $p.iface.OCombo({
				parent: toolbar.div.obj,
				obj: eclr,
				field: "clr_out",
				width: 150,
				hide_frm: true,
				get_option_list: get_option_list
			});

			clr_in.DOMelem.style.float = "left";
			clr_in.DOMelem_input.placeholder = "Цвет изнутри";
			clr_out.DOMelem_input.placeholder = "Цвет снаружи";

			clr_in.attachEvent("onChange", toolbar.call_event);
			clr_out.attachEvent("onChange", toolbar.call_event);
			clr_in.attachEvent("onBlur", toolbar.call_event);
			clr_out.attachEvent("onBlur", toolbar.call_event);

			return wnd;
		}
	}
});

