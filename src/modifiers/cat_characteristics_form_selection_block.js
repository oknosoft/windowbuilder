/**
 * Форма выбора типового блока
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_characteristics_form_selection_block
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.characteristics,
			selection_block;

		// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
		_mgr.form_selection_block = function(pwnd, attr){

			if(!attr)
				attr = {};

			if(!selection_block){
				selection_block = {
					_obj: {
						_calc_order: $p.blank.guid
					}
				};

				selection_block.__define({

					// виртуальные метаданные для автоформ
					_metadata: {
						get : function(){
							var t = this,
								calc_order = $p.cat.characteristics.metadata().fields.calc_order._clone();

							calc_order.choice_links = [{
								name: ["selection",	"ref"],
								path: [
									function(o, f){
										var selection = t instanceof Filling ?
										{elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}} :
										{elm_type: t.nom.elm_type};

										if($p.is_data_obj(o)){
											var ok = false;
											selection.nom = o;
											t.project._dp.sys.elmnts.find_rows(selection, function (row) {
												ok = true;
												return false;
											});
											return ok;
										}else{
											var refs = "";
											t.project._dp.sys.elmnts.find_rows(selection, function (row) {
												if(refs)
													refs += ", ";
												refs += "'" + row.nom.ref + "'";
											});
											return "_t_.ref in (" + refs + ")";
										}
									}]}
							];

							return {
								fields: {
									calc_order: calc_order
								}
							};
						}
					},

					// виртуальный датаменеджер для автоформ
					_manager: {
						get: function () {
							return {
								class_name: "dp.fake"
							};
						}
					},

					calc_order: {
						get: function () {
							return _mgr._obj_сonstructor.prototype._getter.call(this, "calc_order");
						},

						set: function (v) {
							if(this._obj[f] == v)
								return;
							_mgr._obj_сonstructor.prototype.__notify.call(this, "calc_order");
							_mgr._obj_сonstructor.prototype.__setter.call(this, "calc_order", v);
						}
					}

				});
			}

			selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
			if(!selection_block.calc_order.empty()){
				$p.cat.predefined_elmnts.predefined("Расчет_ТиповойБлок").some(function (o) {
					selection_block.calc_order = o;
					$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
					return true;
				});
			}
			attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");
			if(!attr.initial_value){

			}
			//attr.selection = [{calc_order: selection_block.calc_order}];

			var wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

			wnd.elmnts.toolbar.hideItem("btn_new");
			wnd.elmnts.toolbar.hideItem("btn_edit");
			wnd.elmnts.toolbar.hideItem("btn_delete");

			wnd.elmnts.filter.add_filter({
				text: "Расчет",
				name: "calc_order"
			});
			var fdiv = wnd.elmnts.filter.additional.calc_order.parentNode;
			fdiv.removeChild(fdiv.firstChild);

			wnd.elmnts.filter.additional.calc_order = new $p.iface.OCombo({
				parent: fdiv,
				obj: selection_block,
				field: "calc_order",
				width: 200,
				get_option_list: function (val, selection) {

					var l = [];

					$p.cat.predefined_elmnts.predefined("Расчет_ТиповойБлок").forEach(function (o) {
						l.push({text: o.presentation, value: o.ref});
					});

					return Promise.resolve(l);
				}
			});
			wnd.elmnts.filter.additional.calc_order.getBase().style.border = "none";

			return wnd;
		};

	}
);