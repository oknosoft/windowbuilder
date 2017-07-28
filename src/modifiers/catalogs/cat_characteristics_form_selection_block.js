/**
 * ### Форма выбора типового блока
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_characteristics_form_selection_block
 *
 * Created 23.12.2015
 */

(function($p){

	const _mgr = $p.cat.characteristics;
  const _meta = _mgr.metadata()._clone();
	let selection_block, wnd;

	// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
	_mgr.form_selection_block = function(pwnd, attr = {}){

		if(!selection_block){
			selection_block = {
				_obj: {
					_calc_order: $p.utils.blank.guid
				}
			};
			_meta.form = {
				selection: {
					fields: ["presentation","svg"],
					cols: [
						{"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
						{"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
					]
				}
			};

			selection_block.__define({

				// виртуальные метаданные для поля фильтра по заказу
				_metadata: {
					value : function(f){

						// возвращаем типовые метаданные зарактеристики, но могли бы вернуть изменённый клон
						//var calc_order = $p.cat.characteristics.metadata().fields.calc_order._clone();
						// calc_order.choice_links = [{
						// 	name: ["selection",	"s"],
						// 	path: [
						// 		function(o, f){
						//
						// 			if($p.utils.is_data_obj(o)){
						// 				return o.s > 0;
						//
						// 			}else{
						// 				var refs = "";
						// 				t.project._dp.sys.elmnts.find_rows(selection, function (row) {
						// 					if(refs)
						// 						refs += ", ";
						// 					refs += "'" + row.nom.ref + "'";
						// 				});
						// 				return "_t_.ref in (" + refs + ")";
						// 			}
						// 		}]}
						// ];

						return f ? _meta.fields.calc_order : {
							fields: {
								calc_order: _meta.fields.calc_order
							}
						};
					}
				},

				// виртуальный датаменеджер для поля фильтра по заказу
				_manager: {
					get: function () {
						return {
              value_mgr: $p.md.value_mgr,
							class_name: "dp.fake"
						};
					}
				},

				// при изменении заказа, обновляем табличную часть
				calc_order: {
					get: function () {
						return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
					},

					set: function (v) {
						if(!v || v == this._obj.calc_order){
              return;
            }
            // если вместо заказа прибежала харакетристика - возвращаем её в качестве результата
            if(v._block){
              wnd && wnd.close();
              return attr.on_select && attr.on_select(v._block);
            }
						$p.CatCharacteristics.prototype.__setter.call(this, "calc_order", v);

						if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount()){
              wnd.elmnts.filter.call_event();
            }

						if(!$p.utils.is_empty_guid(this._obj.calc_order) &&
							$p.wsql.get_user_param("template_block_calc_order") != this._obj.calc_order){
							$p.wsql.set_user_param("template_block_calc_order", this._obj.calc_order);
						}
					}
				}
			});
		}

		// объект отбора по ссылке на расчет в продукции
		if(selection_block.calc_order.empty()){
			selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
		}
		if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			$p.job_prm.builder.base_block.some((o) => {
				selection_block.calc_order = o;
				$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
				return true;
			});
		}

		// начальное значение - выбранные в предыдущий раз типовой блок
		attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

		// подсовываем типовой форме списка изменённые метаданные
		attr.metadata = _meta;

		// и еще, подсовываем форме собственный обработчик получения данных
		attr.custom_selection = function (attr) {
			const ares = [], crefs = [];
			let calc_order;

			// получаем ссылку на расчет из отбора
			attr.selection.some((o) => {
				if(Object.keys(o).indexOf("calc_order") != -1){
					calc_order = o.calc_order;
					return true;
				}
			});

			// получаем документ расчет
			return $p.doc.calc_order.get(calc_order, true, true)
				.then((o) => {

					// получаем массив ссылок на характеристики в табчасти продукции
					o.production.each((row) => {
						if(!row.characteristic.empty()){
							if(row.characteristic.is_new()){
                crefs.push(row.characteristic.ref);
              }
							else{
								// если это характеристика продукции - добавляем
								if(!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()){
									if(row.characteristic._attachments &&
										row.characteristic._attachments.svg &&
										!row.characteristic._attachments.svg.stub){
                    ares.push(row.characteristic);
                  }
									else{
                    crefs.push(row.characteristic.ref);
                  }
								}
							}
						}
					});
					return crefs.length ? _mgr.pouch_load_array(crefs, true) : crefs;
				})
				.then(() => {

					// если это характеристика продукции - добавляем
					crefs.forEach((o) => {
						o = _mgr.get(o, false, true);
						if(o && !o.calc_order.empty() && o.coordinates.count()){
							ares.push(o);
						}
					});

					// фильтруем по подстроке
					crefs.length = 0;
					ares.forEach((o) => {
            const presentation = (o.calc_order_row.note || o.note || o.name) + "<br />" + o.owner.name;
						if(!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase()))
							crefs.push({
								ref: o.ref,
								presentation: presentation,
								svg: o._attachments ? o._attachments.svg : ""
							});
					});

					// догружаем изображения
					ares.length = 0;
					crefs.forEach((o) => {
						if(o.svg && o.svg.data){
							ares.push($p.utils.blob_as_text(o.svg.data)
								.then(function (svg) {
									o.svg = svg;
								}))
						}
					});
					return Promise.all(ares);

				})
        // конвертируем в xml для вставки в грид
				.then(() => $p.iface.data_to_grid.call(_mgr, crefs, attr));

		};

		// создаём форму списка
		wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

		wnd.elmnts.toolbar.hideItem("btn_new");
		wnd.elmnts.toolbar.hideItem("btn_edit");
		wnd.elmnts.toolbar.hideItem("btn_delete");

		// добавляем элемент управления фильтра по расчету
		wnd.elmnts.filter.add_filter({
			text: "Расчет",
			name: "calc_order"
		});
    const fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
		fdiv.removeChild(fdiv.firstChild);

		wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
			parent: fdiv,
			obj: selection_block,
			field: "calc_order",
			width: 220,
			get_option_list: (selection, val) => new Promise((resolve, reject) => {

			  setTimeout(() => {
          const l = [];

          $p.job_prm.builder.base_block.forEach(({note, presentation, ref}) => {
            if(selection.presentation && selection.presentation.like){
              if(note.toLowerCase().match(selection.presentation.like.toLowerCase()) ||
                presentation.toLowerCase().match(selection.presentation.like.toLowerCase())){
                l.push({text: note || presentation, value: ref});
              }
            }else{
              l.push({text: note || presentation, value: ref});
            }
          });

          l.sort((a, b) => {
            if (a.text < b.text){
              return -1;
            }
            else if (a.text > b.text){
              return 1;
            }
            else{
              return 0;
            }
          });

          resolve(l);

        }, $p.job_prm.builder.base_block ? 0 : 1000)
			})
		});
		wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};

})($p);
